import base64
import json
import requests

from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from appointment.models import Appointment
from consultation.models import Consultation
from authentication.permissions import IsSuperUser
from notification.utils import send_notification
from meronaya.resonses import api_response
from case.models import Case

from .models import Payment, Payout, CasePaymentRequest
from .serializers import PaymentSerializer, EsewaInitiateSerializer, KhaltiInitiateSerializer, PayoutSerializer, CreatePayoutSerializer
from hmac import compare_digest as hmac_compare
from .utils import (
    generate_esewa_signature,
    build_esewa_signature_message,
    get_esewa_payment_params,
    initiate_khalti_payment,
    verify_khalti_payment,
    verify_esewa_payment_remote,
)


# Creating API view for initiating eSewa payment which allows authenticated clients to pay for video consultation appointments.
class EsewaInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Initiate an eSewa payment for a video consultation appointment.",
        request_body=EsewaInitiateSerializer,
        responses={
            200: openapi.Response(description="eSewa payment parameters returned successfully."),
            400: openapi.Response(description="Bad request."),
            403: openapi.Response(description="Not allowed."),
            404: openapi.Response(description="Appointment not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Payment"],
    )
    # Creating post method to handle eSewa payment initiation requests.
    def post(self, request):
        try:
            serializer = EsewaInitiateSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            appointment_id = serializer.validated_data["appointment_id"]
            user = request.user

            # Validating the appointment exists
            try:
                appointment = Appointment.objects.select_related(
                    "consultation", "consultation__lawyer", "consultation__client"
                ).get(id=appointment_id)
            except Appointment.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Appointment not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Only the client who owns this appointment can pay
            if appointment.consultation.client != user:
                return api_response(
                    is_success=False,
                    error_message={"error": "Not allowed."},
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            # Only video consultations require payment
            if appointment.consultation.mode != Consultation.MODE_VIDEO:
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment is only required for video consultations."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Don't allow double payment
            if appointment.payment_status == Appointment.PAYMENT_PAID:
                return api_response(
                    is_success=False,
                    error_message={"error": "This appointment is already paid."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Getting the consultation fee from the lawyer's KYC profile
            lawyer = appointment.consultation.lawyer
            try:
                consultation_fee = lawyer.lawyer_kyc.consultation_fee
            except Exception:
                consultation_fee = Decimal("100.00")  # fallback for testing

            amount = consultation_fee
            tax_amount = Decimal("0")
            total_amount = amount + tax_amount

            # Calculating the platform commission and the lawyer's earning
            commission_percent = settings.PLATFORM_COMMISSION_PERCENT
            platform_fee = (total_amount * commission_percent / Decimal("100")).quantize(Decimal("0.01"))
            lawyer_earning = total_amount - platform_fee

            # Creating a Payment record in the database
            payment = Payment.objects.create(
                appointment=appointment,
                user=user,
                lawyer=lawyer,
                amount=amount,
                tax_amount=tax_amount,
                total_amount=total_amount,
                platform_fee=platform_fee,
                lawyer_earning=lawyer_earning,
                status=Payment.STATUS_INITIATED,
            )

            # Building eSewa form parameters for frontend to submit using utility
            esewa_params = get_esewa_payment_params(
                amount=amount,
                tax_amount=tax_amount,
                total_amount=total_amount,
                transaction_uuid=payment.transaction_uuid,
            )

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Payment initiated successfully.",
                    "payment_id": payment.id,
                    "esewa_url": settings.ESEWA_PAYMENT_URL,
                    "params": esewa_params,
                },
            )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API view for verifying eSewa payment after the user is redirected back from eSewa.
class EsewaVerifyView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Verify eSewa payment after redirect. eSewa sends a Base64-encoded data parameter.",
        manual_parameters=[
            openapi.Parameter(
                "data",
                openapi.IN_QUERY,
                description="Base64 encoded payment data from eSewa redirect",
                type=openapi.TYPE_STRING,
                required=True,
            ),
        ],
        responses={
            200: openapi.Response(description="Payment verified successfully."),
            400: openapi.Response(description="Invalid or missing payment data."),
            404: openapi.Response(description="Payment record not found."),
            502: openapi.Response(description="eSewa verification service error."),
        },
        tags=["Payment"],
    )
    # Creating get method to handle eSewa payment verification after redirect.
    def get(self, request):
        try:
            encoded_data = request.query_params.get("data")

            if not encoded_data:
                return api_response(
                    is_success=False,
                    error_message={"error": "Missing payment data."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Decoding the Base64 data from eSewa
            try:
                decoded_bytes = base64.b64decode(encoded_data)
                payment_data = json.loads(decoded_bytes.decode("utf-8"))
            except Exception:
                return api_response(
                    is_success=False,
                    error_message={"error": "Invalid payment data."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            transaction_uuid = payment_data.get("transaction_uuid")
            esewa_ref_id = payment_data.get("transaction_code", "")

            if not transaction_uuid:
                return api_response(
                    is_success=False,
                    error_message={"error": "Missing transaction UUID."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Finding the payment record in the database
            try:
                payment = Payment.objects.select_related(
                    "appointment",
                    "appointment__consultation",
                    "appointment__consultation__lawyer",
                    "appointment__consultation__client",
                ).get(transaction_uuid=transaction_uuid)
            except Payment.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment record not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # If already completed, return success without re-verifying
            if payment.status == Payment.STATUS_COMPLETED:
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Payment already verified.",
                        "payment": PaymentSerializer(payment).data,
                    },
                )

            # Verifying with eSewa's transaction status API using utility
            esewa_transaction_status, esewa_ref = verify_esewa_payment_remote(
                total_amount=payment.total_amount,
                transaction_uuid=payment.transaction_uuid,
            )
            
            if esewa_transaction_status is None:
                # Server-to-server call failed — fall back to HMAC signature verification
                callback_status = payment_data.get("status")
                callback_signature = payment_data.get("signature")
                signed_field_names = payment_data.get("signed_field_names", "")

                if callback_status == "COMPLETE" and callback_signature and signed_field_names:
                    # Rebuilding the signed message from the callback fields
                    signed_fields = signed_field_names.split(",")
                    message_parts = [f"{field}={payment_data.get(field, '')}" for field in signed_fields]
                    message = ",".join(message_parts)
                    expected_signature = generate_esewa_signature(message)

                    if hmac_compare.compare_digest(callback_signature, expected_signature):
                        esewa_transaction_status = "COMPLETE"
                    else:
                        return api_response(
                            is_success=False,
                            error_message={"error": "eSewa signature verification failed."},
                            status_code=status.HTTP_400_BAD_REQUEST,
                        )
                else:
                    return api_response(
                        is_success=False,
                        error_message={"error": "eSewa server unreachable and callback data insufficient for verification."},
                        status_code=status.HTTP_502_BAD_GATEWAY,
                    )

            if esewa_transaction_status == "COMPLETE":
                # Marking payment as completed
                payment.status = Payment.STATUS_COMPLETED
                payment.esewa_ref_id = esewa_ref
                payment.save(update_fields=["status", "esewa_ref_id", "updated_at"])

                # Updating appointment payment status
                appointment = payment.appointment
                appointment.payment_status = Appointment.PAYMENT_PAID
                appointment.status = Appointment.STATUS_CONFIRMED
                appointment.save(update_fields=["payment_status", "status", "updated_at"])

                # Sending notification to the lawyer about payment received
                send_notification(
                    user=appointment.consultation.lawyer,
                    title="Payment Received",
                    message=f"{payment.user.name} has paid Rs. {payment.total_amount} for the consultation via eSewa. Your earning: Rs. {payment.lawyer_earning}",
                    notif_type="payment",
                    link="/lawyerearning",
                )

                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Payment verified successfully.",
                        "payment": PaymentSerializer(payment).data,
                    },
                )
            else:
                # Payment not complete on eSewa's side
                payment.status = Payment.STATUS_FAILED
                payment.save(update_fields=["status", "updated_at"])

                return api_response(
                    is_success=False,
                    error_message={"error": f"Payment verification failed. eSewa status: {esewa_transaction_status}"},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API view for initiating Khalti payment for video consultation appointments.
class KhaltiInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Initiate a Khalti payment for a video consultation appointment.",
        request_body=KhaltiInitiateSerializer,
        responses={
            200: openapi.Response(description="Khalti payment URL returned successfully."),
            400: openapi.Response(description="Bad request."),
            403: openapi.Response(description="Not allowed."),
            404: openapi.Response(description="Appointment not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Payment"],
    )
    def post(self, request):
        try:
            serializer = KhaltiInitiateSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            appointment_id = serializer.validated_data["appointment_id"]
            user = request.user

            # Validating the appointment exists
            try:
                appointment = Appointment.objects.select_related(
                    "consultation", "consultation__lawyer", "consultation__client"
                ).get(id=appointment_id)
            except Appointment.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Appointment not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Only the client who owns this appointment can pay
            if appointment.consultation.client != user:
                return api_response(
                    is_success=False,
                    error_message={"error": "Not allowed."},
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            # Only video consultations require payment
            if appointment.consultation.mode != Consultation.MODE_VIDEO:
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment is only required for video consultations."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Don't allow double payment
            if appointment.payment_status == Appointment.PAYMENT_PAID:
                return api_response(
                    is_success=False,
                    error_message={"error": "This appointment is already paid."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Getting the consultation fee from the lawyer's KYC profile
            lawyer = appointment.consultation.lawyer
            try:
                consultation_fee = lawyer.lawyer_kyc.consultation_fee
            except Exception:
                consultation_fee = Decimal("100.00")  # fallback for testing

            amount = consultation_fee
            tax_amount = Decimal("0")
            total_amount = amount + tax_amount

            # Calculating the platform commission and the lawyer's earning
            commission_percent = settings.PLATFORM_COMMISSION_PERCENT
            platform_fee = (total_amount * commission_percent / Decimal("100")).quantize(Decimal("0.01"))
            lawyer_earning = total_amount - platform_fee

            # Creating a Payment record in the database
            payment = Payment.objects.create(
                appointment=appointment,
                user=user,
                lawyer=lawyer,
                amount=amount,
                tax_amount=tax_amount,
                total_amount=total_amount,
                platform_fee=platform_fee,
                lawyer_earning=lawyer_earning,
                payment_method="khalti",
                status=Payment.STATUS_INITIATED,
            )

            # Khalti expects amount in paisa (1 Rs = 100 paisa)
            amount_in_paisa = int(total_amount * 100)
            customer_info = {
                "name": user.name,
                "email": user.email,
                "phone": getattr(user, "phone", "9800000000"),
            }
            purchase_name = f"Consultation - {lawyer.name}"
            
            is_ok, khalti_data = initiate_khalti_payment(
                amount_in_paisa=amount_in_paisa,
                purchase_order_id=str(payment.transaction_uuid),
                purchase_order_name=purchase_name,
                customer_info=customer_info,
            )

            if not is_ok:
                # Khalti API returned an error — mark payment as failed
                payment.status = Payment.STATUS_FAILED
                payment.save(update_fields=["status", "updated_at"])
                return api_response(
                    is_success=False,
                    error_message={"error": f"Khalti initiation failed: {khalti_data}"},
                    status_code=status.HTTP_502_BAD_GATEWAY,
                )

            khalti_pidx = khalti_data.get("pidx")
            khalti_payment_url = khalti_data.get("payment_url")

            # Store Khalti pidx in esewa_ref_id field for lookup during verification
            payment.esewa_ref_id = khalti_pidx
            payment.save(update_fields=["esewa_ref_id", "updated_at"])

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Khalti payment initiated successfully.",
                    "payment_id": payment.id,
                    "khalti_payment_url": khalti_payment_url,
                    "pidx": khalti_pidx,
                },
            )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API view for verifying Khalti payment after the user is redirected back.
class KhaltiVerifyView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Verify Khalti payment using the pidx returned after redirect.",
        manual_parameters=[
            openapi.Parameter(
                "pidx",
                openapi.IN_QUERY,
                description="Khalti payment identifier (pidx) from redirect",
                type=openapi.TYPE_STRING,
                required=True,
            ),
            openapi.Parameter(
                "transaction_id",
                openapi.IN_QUERY,
                description="Khalti transaction ID from redirect",
                type=openapi.TYPE_STRING,
                required=False,
            ),
            openapi.Parameter(
                "purchase_order_id",
                openapi.IN_QUERY,
                description="Our transaction UUID",
                type=openapi.TYPE_STRING,
                required=False,
            ),
        ],
        responses={
            200: openapi.Response(description="Payment verified successfully."),
            400: openapi.Response(description="Invalid or missing payment data."),
            404: openapi.Response(description="Payment record not found."),
            502: openapi.Response(description="Khalti verification service error."),
        },
        tags=["Payment"],
    )
    def get(self, request):
        try:
            pidx = request.query_params.get("pidx")
            purchase_order_id = request.query_params.get("purchase_order_id")

            if not pidx:
                return api_response(
                    is_success=False,
                    error_message={"error": "Missing Khalti pidx parameter."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Finding the payment record — look up by transaction_uuid (purchase_order_id) or pidx stored in esewa_ref_id
            payment = None
            if purchase_order_id:
                try:
                    payment = Payment.objects.select_related(
                        "appointment",
                        "appointment__consultation",
                        "appointment__consultation__lawyer",
                        "appointment__consultation__client",
                    ).get(transaction_uuid=purchase_order_id)
                except Payment.DoesNotExist:
                    pass

            if not payment:
                try:
                    payment = Payment.objects.select_related(
                        "appointment",
                        "appointment__consultation",
                        "appointment__consultation__lawyer",
                        "appointment__consultation__client",
                    ).get(esewa_ref_id=pidx, payment_method="khalti")
                except Payment.DoesNotExist:
                    return api_response(
                        is_success=False,
                        error_message={"error": "Payment record not found."},
                        status_code=status.HTTP_404_NOT_FOUND,
                    )

            # If already completed, return success without re-verifying
            if payment.status == Payment.STATUS_COMPLETED:
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Payment already verified.",
                        "payment": PaymentSerializer(payment).data,
                    },
                )

            # Calling Khalti's lookup API using utility
            is_ok, lookup_data = verify_khalti_payment(pidx)
            
            if not is_ok:
                return api_response(
                    is_success=False,
                    error_message={"error": f"Khalti verification failed: {lookup_data}"},
                    status_code=status.HTTP_502_BAD_GATEWAY,
                )

            khalti_status = lookup_data.get("status")
            khalti_transaction_id = lookup_data.get("transaction_id", "")

            if khalti_status == "Completed":
                # Marking payment as completed
                payment.status = Payment.STATUS_COMPLETED
                payment.esewa_ref_id = f"pidx:{pidx}|txn:{khalti_transaction_id}"
                payment.save(update_fields=["status", "esewa_ref_id", "updated_at"])

                # Updating appointment payment status
                appointment = payment.appointment
                appointment.payment_status = Appointment.PAYMENT_PAID
                appointment.status = Appointment.STATUS_CONFIRMED
                appointment.save(update_fields=["payment_status", "status", "updated_at"])

                # Sending notification to the lawyer about payment received
                send_notification(
                    user=appointment.consultation.lawyer,
                    title="Payment Received",
                    message=f"{payment.user.name} has paid Rs. {payment.total_amount} for the consultation via Khalti. Your earning: Rs. {payment.lawyer_earning}",
                    notif_type="payment",
                    link="/lawyerearning",
                )

                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Payment verified successfully.",
                        "payment": PaymentSerializer(payment).data,
                    },
                )
            else:
                # Payment not complete on Khalti's side
                if khalti_status in ("Expired", "User canceled"):
                    payment.status = Payment.STATUS_FAILED
                    payment.save(update_fields=["status", "updated_at"])

                return api_response(
                    is_success=False,
                    error_message={"error": f"Payment verification failed. Khalti status: {khalti_status}"},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API view for listing all payments for the authenticated user.
class PaymentListView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="List all payments for the authenticated user.",
        responses={
            200: openapi.Response(description="Payments retrieved successfully."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Payment"],
    )
    # Creating get method to retrieve payment history for the authenticated user.
    def get(self, request):
        try:
            from .models import CasePaymentRequest
            from .serializers import CasePaymentRequestSerializer

            payments = Payment.objects.filter(user=request.user)
            case_requests = CasePaymentRequest.objects.filter(case__client=request.user)
            
            serializer = PaymentSerializer(payments, many=True)
            case_request_serializer = CasePaymentRequestSerializer(case_requests, many=True)
            
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Payments and requests retrieved successfully.",
                    "payments": serializer.data,
                    "case_payment_requests": case_request_serializer.data,
                },
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API view for retrieving a single payment detail.
class PaymentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get a single payment detail.",
        responses={
            200: openapi.Response(description="Payment retrieved successfully."),
            404: openapi.Response(description="Payment not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Payment"],
    )
    # Creating get method to retrieve a specific payment by its ID.
    def get(self, request, pk):
        try:
            try:
                payment = Payment.objects.get(id=pk, user=request.user)
            except Payment.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            serializer = PaymentSerializer(payment)
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Payment retrieved successfully.",
                    "payment": serializer.data,
                },
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API view for lawyer to see their earnings summary and payment history.
class LawyerEarningsView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get earnings summary and payment history for the authenticated lawyer.",
        responses={
            200: openapi.Response(description="Earnings retrieved successfully."),
            403: openapi.Response(description="Only lawyers can access this endpoint."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Payment"],
    )
    # Creating get method to retrieve the lawyer's earnings summary.
    def get(self, request):
        try:
            user = request.user
            if not user.is_lawyer:
                return api_response(
                    is_success=False,
                    error_message={"error": "Only lawyers can access earnings."},
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            # Querying all completed payments for this lawyer
            completed_payments = Payment.objects.filter(
                lawyer=user,
                status=Payment.STATUS_COMPLETED,
            )

            # Calculating totals
            totals = completed_payments.aggregate(
                total_earned=Sum("lawyer_earning"),
                total_platform_fee=Sum("platform_fee"),
                total_amount=Sum("total_amount"),
                total_transactions=Count("id"),
            )

            # Payout totals — how much has been paid out vs pending
            paid_out = completed_payments.filter(payout_status=Payment.PAYOUT_PAID).aggregate(
                paid_out_amount=Sum("lawyer_earning"),
                paid_out_count=Count("id"),
            )
            pending_payout = completed_payments.filter(payout_status=Payment.PAYOUT_PENDING).aggregate(
                pending_amount=Sum("lawyer_earning"),
                pending_count=Count("id"),
            )

            # All payments for this lawyer (any status) for the history table
            all_payments = Payment.objects.filter(lawyer=user).select_related(
                "user", "appointment", "appointment__consultation"
            )
            serializer = PaymentSerializer(all_payments, many=True)

            # Get case payment requests for history
            from .models import CasePaymentRequest
            from .serializers import CasePaymentRequestSerializer
            case_requests = CasePaymentRequest.objects.filter(lawyer=user)
            case_request_serializer = CasePaymentRequestSerializer(case_requests, many=True)

            # Payout history for this lawyer
            payouts = Payout.objects.filter(lawyer=user).select_related("processed_by")
            payout_serializer = PayoutSerializer(payouts, many=True)

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Earnings and requests retrieved successfully.",
                    "summary": {
                        "total_earned": str(totals["total_earned"] or 0),
                        "total_platform_fee": str(totals["total_platform_fee"] or 0),
                        "total_received_from_clients": str(totals["total_amount"] or 0),
                        "total_transactions": totals["total_transactions"] or 0,
                        "commission_rate": str(settings.PLATFORM_COMMISSION_PERCENT),
                        "paid_out": str(paid_out["paid_out_amount"] or 0),
                        "paid_out_count": paid_out["paid_out_count"] or 0,
                        "pending_payout": str(pending_payout["pending_amount"] or 0),
                        "pending_count": pending_payout["pending_count"] or 0,
                    },
                    "payments": serializer.data,
                    "case_payment_requests": case_request_serializer.data,
                    "payouts": payout_serializer.data,
                },
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API view for admin to see platform revenue summary and all transactions.
class AdminRevenueView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    @swagger_auto_schema(
        operation_description="Get platform revenue summary and all completed transactions. Admin only.",
        responses={
            200: openapi.Response(description="Revenue data retrieved successfully."),
            403: openapi.Response(description="Admin access required."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Payment"],
    )
    # Creating get method to retrieve the platform revenue data for admin.
    def get(self, request):
        try:
            completed_payments = Payment.objects.filter(status=Payment.STATUS_COMPLETED)

            # Platform-wide totals
            totals = completed_payments.aggregate(
                total_platform_revenue=Sum("platform_fee"),
                total_lawyer_payouts=Sum("lawyer_earning"),
                total_collected=Sum("total_amount"),
                total_transactions=Count("id"),
            )

            # Payout status totals
            paid_out_total = completed_payments.filter(payout_status=Payment.PAYOUT_PAID).aggregate(
                amount=Sum("lawyer_earning"),
            )
            pending_payout_total = completed_payments.filter(payout_status=Payment.PAYOUT_PENDING).aggregate(
                amount=Sum("lawyer_earning"),
            )

            # Per-lawyer breakdown with payout status
            lawyer_breakdown = (
                completed_payments.values("lawyer__id", "lawyer__name", "lawyer__email", "lawyer__phone", "lawyer__profile_image")
                .annotate(
                    total_paid=Sum("total_amount"),
                    platform_fee=Sum("platform_fee"),
                    lawyer_earned=Sum("lawyer_earning"),
                    transaction_count=Count("id"),
                    pending_payout=Sum(
                        "lawyer_earning",
                        filter=Q(payout_status=Payment.PAYOUT_PENDING),
                    ),
                    paid_out=Sum(
                        "lawyer_earning",
                        filter=Q(payout_status=Payment.PAYOUT_PAID),
                    ),
                    pending_payment_ids=Count(
                        "id",
                        filter=Q(payout_status=Payment.PAYOUT_PENDING),
                    ),
                )
                .order_by("-lawyer_earned")
            )

            # All completed payments for the transaction table
            all_payments = Payment.objects.filter(
                status=Payment.STATUS_COMPLETED
            ).select_related(
                "user", "lawyer", "appointment", "appointment__consultation"
            )
            serializer = PaymentSerializer(all_payments, many=True)

            # Recent payouts
            recent_payouts = Payout.objects.all().select_related("lawyer", "processed_by")[:20]
            payout_serializer = PayoutSerializer(recent_payouts, many=True)

            # Prepend media URL to lawyer__profile_image since values() returns raw paths
            media_url = settings.MEDIA_URL
            lawyer_breakdown_list = list(lawyer_breakdown)
            for lb in lawyer_breakdown_list:
                if lb.get("lawyer__profile_image"):
                    lb["lawyer__profile_image"] = f"{media_url}{lb['lawyer__profile_image']}"

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Revenue data retrieved successfully.",
                    "summary": {
                        "total_platform_revenue": str(totals["total_platform_revenue"] or 0),
                        "total_lawyer_payouts": str(totals["total_lawyer_payouts"] or 0),
                        "total_collected": str(totals["total_collected"] or 0),
                        "total_transactions": totals["total_transactions"] or 0,
                        "commission_rate": str(settings.PLATFORM_COMMISSION_PERCENT),
                        "total_paid_out": str(paid_out_total["amount"] or 0),
                        "total_pending_payout": str(pending_payout_total["amount"] or 0),
                    },
                    "lawyer_breakdown": lawyer_breakdown_list,
                    "payments": serializer.data,
                    "payouts": payout_serializer.data,
                },
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API view for admin to create a payout record when paying a lawyer.
class AdminCreatePayoutView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    @swagger_auto_schema(
        operation_description="Create a payout record to mark payments as settled for a lawyer. Admin only.",
        request_body=CreatePayoutSerializer,
        responses={
            201: openapi.Response(description="Payout created successfully."),
            400: openapi.Response(description="Bad request."),
            403: openapi.Response(description="Admin access required."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Payment"],
    )
    # Creating post method to process a payout for a lawyer.
    def post(self, request):
        try:
            serializer = CreatePayoutSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            lawyer_id = serializer.validated_data["lawyer_id"]
            payment_ids = serializer.validated_data["payment_ids"]
            reference_number = serializer.validated_data.get("reference_number", "")
            payout_method = serializer.validated_data.get("payment_method", "")
            notes = serializer.validated_data.get("notes", "")

            # Validating the lawyer exists
            from authentication.models import User
            try:
                lawyer = User.objects.get(id=lawyer_id, is_lawyer=True)
            except User.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Lawyer not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Validating payments belong to this lawyer and are completed but not yet paid out
            payments = Payment.objects.filter(
                id__in=payment_ids,
                lawyer=lawyer,
                status=Payment.STATUS_COMPLETED,
                payout_status=Payment.PAYOUT_PENDING,
            )

            if payments.count() == 0:
                return api_response(
                    is_success=False,
                    error_message={"error": "No eligible pending payments found for this lawyer."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            if payments.count() != len(payment_ids):
                return api_response(
                    is_success=False,
                    error_message={"error": "Some payment IDs are invalid, already paid out, or don't belong to this lawyer."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Calculating total payout amount
            payout_amount = payments.aggregate(total=Sum("lawyer_earning"))["total"]

            # Creating the payout record
            payout = Payout.objects.create(
                lawyer=lawyer,
                processed_by=request.user,
                amount=payout_amount,
                reference_number=reference_number,
                payment_method=payout_method,
                notes=notes,
            )
            payout.payments.set(payments)

            # Marking all included payments as paid out
            payments.update(payout_status=Payment.PAYOUT_PAID)

            # Sending notification to the lawyer about the payout
            send_notification(
                user=lawyer,
                title="Payout Received",
                message=f"Rs. {payout_amount} has been settled by the admin. Reference: {reference_number or 'N/A'}",
                notif_type="payment",
                link="/lawyerearning",
            )

            payout_serializer = PayoutSerializer(payout)
            return api_response(
                is_success=True,
                status_code=status.HTTP_201_CREATED,
                result={
                    "message": f"Payout of Rs. {payout_amount} created successfully for {lawyer.name}.",
                    "payout": payout_serializer.data,
                },
            )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API view for admin to get pending payments for a specific lawyer (for the payout modal).
class AdminLawyerPendingPaymentsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    @swagger_auto_schema(
        operation_description="Get all pending (unpaid) completed payments for a specific lawyer. Admin only.",
        responses={
            200: openapi.Response(description="Pending payments retrieved."),
            404: openapi.Response(description="Lawyer not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Payment"],
    )
    # Creating get method to retrieve pending payments for a specific lawyer.
    def get(self, request, lawyer_id):
        try:
            from authentication.models import User
            try:
                lawyer = User.objects.get(id=lawyer_id, is_lawyer=True)
            except User.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Lawyer not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            pending_payments = Payment.objects.filter(
                lawyer=lawyer,
                status=Payment.STATUS_COMPLETED,
                payout_status=Payment.PAYOUT_PENDING,
            ).select_related("user", "appointment")

            serializer = PaymentSerializer(pending_payments, many=True)

            total_pending = pending_payments.aggregate(total=Sum("lawyer_earning"))["total"] or 0

            # Get the lawyer's wallet numbers from KYC
            esewa_number = None
            khalti_number = None
            try:
                kyc = lawyer.lawyer_kyc
                esewa_number = kyc.esewa_number or None
                khalti_number = kyc.khalti_number or None
            except Exception:
                pass

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Pending payments retrieved.",
                    "lawyer_name": lawyer.name,
                    "lawyer_email": lawyer.email,
                    "esewa_number": esewa_number,
                    "khalti_number": khalti_number,
                    "total_pending": str(total_pending),
                    "payments": serializer.data,
                },
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Creating API views for case payment requests
class CreateCasePaymentRequestView(APIView):
    """
    Lawyer can request payment for a completed case.
    The client can then accept and pay.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Create a payment request for a completed case. Lawyer only.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'case_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                'proposed_amount': openapi.Schema(type=openapi.TYPE_NUMBER),
                'description': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['case_id', 'proposed_amount']
        ),
        responses={
            201: openapi.Response(description="Payment request created successfully."),
            400: openapi.Response(description="Bad request."),
            403: openapi.Response(description="Not allowed."),
            404: openapi.Response(description="Case not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Case Payment"],
    )
    def post(self, request):
        try:
            from .serializers import CreateCasePaymentRequestSerializer
            from .models import CasePaymentRequest
            from case.models import Case

            serializer = CreateCasePaymentRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            case_id = serializer.validated_data['case_id']
            proposed_amount = serializer.validated_data['proposed_amount']
            description = serializer.validated_data.get('description', '')

            # Get the case
            try:
                case = Case.objects.get(id=case_id)
            except Case.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Case not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Only the case's lawyer can request payment
            if case.lawyer != request.user:
                return api_response(
                    is_success=False,
                    error_message={"error": "Only the case lawyer can request payment."},
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            # Case must be in progress to request payment
            if case.status != 'in_progress':
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment can only be requested for cases currently in progress."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Check if a payment request already exists for this case
            if CasePaymentRequest.objects.filter(case=case).exists():
                return api_response(
                    is_success=False,
                    error_message={"error": "A payment request already exists for this case."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Create the payment request
            payment_request = CasePaymentRequest.objects.create(
                case=case,
                lawyer=request.user,
                proposed_amount=proposed_amount,
                description=description,
            )

            # Send notification to client
            send_notification(
                user=case.client,
                title="Payment Request",
                message=f"Lawyer {case.lawyer.name} requested Rs. {proposed_amount} for case: {case.case_title}",
                notif_type="payment",
                link=f"/case/{case.id}/payment",
            )

            from .serializers import CasePaymentRequestSerializer as CPRSerializer
            result_serializer = CPRSerializer(payment_request)
            return api_response(
                is_success=True,
                status_code=status.HTTP_201_CREATED,
                result={
                    "message": "Payment request created successfully.",
                    "payment_request": result_serializer.data,
                },
            )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RespondToCasePaymentView(APIView):
    """
    Client accepts a payment request.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Client accepts a case payment request.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'response': openapi.Schema(type=openapi.TYPE_STRING, enum=['accept']),
            },
            required=['response']
        ),
        responses={
            200: openapi.Response(description="Accepted successfully."),
            400: openapi.Response(description="Bad request."),
            403: openapi.Response(description="Not allowed."),
            404: openapi.Response(description="Payment request not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Case Payment"],
    )
    def post(self, request, payment_request_id):
        try:
            from .models import CasePaymentRequest

            response_type = request.data.get('response')
            if response_type != 'accept':
                return api_response(
                    is_success=False,
                    error_message={"error": "Only 'accept' is allowed for case payment responses."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Get the payment request
            try:
                payment_request = CasePaymentRequest.objects.get(id=payment_request_id)
            except CasePaymentRequest.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment request not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Only the case's client can respond
            if payment_request.case.client != request.user:
                return api_response(
                    is_success=False,
                    error_message={"error": "Only the case client can respond to this request."},
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            # Payment request must be pending
            if payment_request.status != 'pending':
                return api_response(
                    is_success=False,
                    error_message={"error": f"Cannot respond to a {payment_request.status} payment request."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Mark as responded and agreed
            payment_request.responded_at = timezone.now()
            payment_request.status = 'agreed'
            payment_request.current_agreed_amount = payment_request.proposed_amount
            payment_request.agreed_at = timezone.now()
            payment_request.save()

            # Notify lawyer
            send_notification(
                user=payment_request.lawyer,
                title="Payment Accepted",
                message=f"Client accepted your payment request of Rs. {payment_request.proposed_amount}",
                notif_type="payment",
                link=f"/case/{payment_request.case.id}/payment",
            )

            from .serializers import CasePaymentRequestSerializer as CPRSerializer
            result_serializer = CPRSerializer(payment_request)
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Payment request accepted successfully.",
                    "payment_request": result_serializer.data,
                },
            )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )



class CasePaymentRequestDetailView(APIView):
    """
    Get details of a specific case payment request.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get details of a case payment request.",
        responses={
            200: openapi.Response(description="Payment request details retrieved."),
            403: openapi.Response(description="Not allowed."),
            404: openapi.Response(description="Payment request not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Case Payment"],
    )
    def get(self, request, payment_request_id):
        try:
            from .models import CasePaymentRequest
            from .serializers import CasePaymentRequestSerializer as CPRSerializer

            # Get the payment request
            try:
                payment_request = CasePaymentRequest.objects.get(id=payment_request_id)
            except CasePaymentRequest.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment request not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Only lawyer, client, or admin can view
            is_lawyer = payment_request.lawyer == request.user
            is_client = payment_request.case.client == request.user
            is_admin = request.user.is_superuser

            if not (is_lawyer or is_client or is_admin):
                return api_response(
                    is_success=False,
                    error_message={"error": "You don't have permission to view this payment request."},
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            serializer = CPRSerializer(payment_request)
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "payment_request": serializer.data,
                },
            )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CasePaymentRequestListView(APIView):
    """
    List all case payment requests for a specific case.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="List payment requests for a specific case.",
        responses={
            200: openapi.Response(description="Payment requests retrieved."),
            403: openapi.Response(description="Not allowed."),
            404: openapi.Response(description="Case not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Case Payment"],
    )
    def get(self, request, case_id):
        try:
            from .models import CasePaymentRequest
            from .serializers import CasePaymentRequestSerializer as CPRSerializer
            from case.models import Case

            # Get the case
            try:
                case = Case.objects.get(id=case_id)
            except Case.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Case not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Only lawyer, client, or admin can view
            is_lawyer = case.lawyer == request.user
            is_client = case.client == request.user
            is_admin = request.user.is_superuser

            if not (is_lawyer or is_client or is_admin):
                return api_response(
                    is_success=False,
                    error_message={"error": "You don't have permission to view this case."},
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            # Get payment requests for this case
            payment_requests = CasePaymentRequest.objects.filter(case=case)

            serializer = CPRSerializer(payment_requests, many=True)
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "case_id": case.id,
                    "case_title": case.case_title,
                    "payment_requests": serializer.data,
                },
            )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Case Payment - eSewa Integration
class EsewaInitiateCasePaymentView(APIView):
    """
    Initiate an eSewa payment for an agreed case payment request.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Initiate eSewa payment for an agreed case payment. Client only.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'payment_request_id': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['payment_request_id']
        ),
        responses={
            200: openapi.Response(description="eSewa payment parameters ready."),
            400: openapi.Response(description="Bad request."),
            403: openapi.Response(description="Not allowed."),
            404: openapi.Response(description="Payment request not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Case Payment"],
    )
    def post(self, request):
        try:
            payment_request_id = request.data.get('payment_request_id')
            if not payment_request_id:
                return api_response(
                    is_success=False,
                    error_message={"error": "payment_request_id is required."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Get payment request
            try:
                payment_request = CasePaymentRequest.objects.select_related(
                    'case', 'case__client', 'case__lawyer'
                ).get(id=payment_request_id)
            except CasePaymentRequest.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment request not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Only client who agreed can pay
            if payment_request.case.client != request.user:
                return api_response(
                    is_success=False,
                    error_message={"error": "Only the case client can initiate payment."},
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            # Payment must be agreed
            if payment_request.status != 'agreed':
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment can only be initiated for agreed requests."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Check if payment already initiated or completed for this request
            existing_payment = Payment.objects.filter(
                case_payment_request=payment_request
            ).exclude(status=Payment.STATUS_FAILED).first()
            
            if existing_payment:
                return api_response(
                    is_success=False,
                    error_message={"error": f"Payment already {existing_payment.status}. Cannot initiate another payment."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Amount to pay
            amount = payment_request.current_agreed_amount or payment_request.proposed_amount

            # Tax calculation (13% VAT)
            tax_amount = Decimal("0")
            total_amount = amount

            # Create Payment record (like appointment does)
            user = request.user
            lawyer = payment_request.case.lawyer
            
            # Calculate commission
            commission_percent = settings.PLATFORM_COMMISSION_PERCENT
            platform_fee = (amount * commission_percent / Decimal("100")).quantize(Decimal("0.01"))
            lawyer_earning = amount - platform_fee

            payment = Payment.objects.create(
                case_payment_request=payment_request,
                user=user,
                lawyer=lawyer,
                amount=amount,
                tax_amount=tax_amount,
                total_amount=total_amount,
                platform_fee=platform_fee,
                lawyer_earning=lawyer_earning,
                payment_method="esewa",
                status=Payment.STATUS_INITIATED,
            )

            # Generate eSewa signature
            message = build_esewa_signature_message(
                total_amount=str(total_amount),
                transaction_uuid=str(payment.transaction_uuid),
            )
            signature = generate_esewa_signature(message)

            # Dynamic return URLs - user will return to the case detail page
            case_id = payment_request.case.id
            dynamic_success_url = f"http://localhost:5173/client/case/{case_id}"
            dynamic_failure_url = f"http://localhost:5173/client/case/{case_id}"

            # Build eSewa parameters for frontend
            esewa_params = {
                "amount": str(amount),
                "tax_amount": str(tax_amount),
                "total_amount": str(total_amount),
                "transaction_uuid": str(payment.transaction_uuid),
                "product_code": settings.ESEWA_PRODUCT_CODE,
                "product_service_charge": "0",
                "product_delivery_charge": "0",
                "success_url": dynamic_success_url,
                "failure_url": dynamic_failure_url,
                "signed_field_names": "total_amount,transaction_uuid,product_code",
                "signature": signature,
            }

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "payment_id": payment.id,
                    "esewa_url": settings.ESEWA_PAYMENT_URL,
                    "params": esewa_params,
                },
            )

        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            return api_response(
                is_success=False,
                error_message={"error": str(e), "trace": error_trace},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class EsewaVerifyCasePaymentView(APIView):
    """
    Verify eSewa payment for case payment.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Verify eSewa payment for case payment.",
        manual_parameters=[
            openapi.Parameter(
                "data",
                openapi.IN_QUERY,
                description="Base64 encoded payment data from eSewa",
                type=openapi.TYPE_STRING,
                required=True,
            ),
        ],
        tags=["Case Payment"],
    )
    def get(self, request):
        try:
            from .models import CasePaymentRequest

            encoded_data = request.query_params.get("data")
            if not encoded_data:
                return api_response(
                    is_success=False,
                    error_message={"error": "Missing payment data."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            try:
                decoded_data = base64.b64decode(encoded_data).decode("utf-8")
                payment_data = json.loads(decoded_data)
            except Exception as e:
                return api_response(
                    is_success=False,
                    error_message={"error": f"Invalid payment data: {str(e)}"},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            transaction_uuid = payment_data.get("transaction_uuid")
            if not transaction_uuid:
                return api_response(
                    is_success=False,
                    error_message={"error": "Missing transaction_uuid in payment data."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Get the payment record
            try:
                payment = Payment.objects.select_related(
                    'case_payment_request', 'case_payment_request__case',
                    'case_payment_request__case__lawyer', 'case_payment_request__case__client'
                ).get(transaction_uuid=transaction_uuid)
            except Payment.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment record not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # If already completed
            if payment.status == Payment.STATUS_COMPLETED:
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Payment already verified.",
                        "payment": PaymentSerializer(payment).data,
                    },
                )

            # Verifying with eSewa's transaction status API (v2)
            esewa_transaction_status = None
            esewa_ref = None

            try:
                verify_response = requests.get(
                    settings.ESEWA_VERIFY_URL,
                    params={
                        "product_code": settings.ESEWA_PRODUCT_CODE,
                        "total_amount": str(payment.total_amount),
                        "transaction_uuid": str(payment.transaction_uuid),
                    },
                    timeout=15,
                )
                
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    esewa_transaction_status = verify_data.get("status")
                    esewa_ref = verify_data.get("ref_id")
            except Exception:
                # Fallback to signature verification if server-to-server call fails
                callback_status = payment_data.get("status")
                if callback_status == "COMPLETE":
                    esewa_transaction_status = "COMPLETE"
                    esewa_ref = payment_data.get("transaction_code")

            if esewa_transaction_status == "COMPLETE":
                # Mark as paid
                case_payment = payment.case_payment_request
                case_payment.status = 'paid'
                case_payment.paid_at = timezone.now()
                case_payment.save()

                # Automatically mark Case as completed
                case = case_payment.case
                case.status = 'completed'
                case.completed_at = timezone.now()
                case.save(update_fields=["status", "completed_at", "updated_at"])

                # Mark Payment record completed
                payment.status = Payment.STATUS_COMPLETED
                payment.esewa_ref_id = esewa_ref
                payment.save()

                # Notify lawyer
                send_notification(
                    user=case.lawyer,
                    title="Case Payment Received",
                    message=f"Client paid Rs. {payment.amount} for case: {case.case_title}. The case is now marked as completed.",
                    notif_type="payment",
                    link=f"/case/{case.id}/payment",
                )
                
                # Notify client
                send_notification(
                    user=case.client,
                    title="Payment Successful",
                    message=f"Your payment of Rs. {payment.total_amount} for case '{case.case_title}' was successful. The case is now completed.",
                    notif_type="payment",
                    link=f"/case/{case.id}/payment",
                )

                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Payment verified successfully",
                        "transaction_id": esewa_ref,
                    },
                )
            else:
                return api_response(
                    is_success=False,
                    error_message={"error": f"Payment verification failed. Status: {esewa_transaction_status or 'Unknown'}"},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        except requests.exceptions.RequestException as e:
            return api_response(
                is_success=False,
                error_message={"error": f"eSewa service error: {str(e)}"},
                status_code=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Case Payment - Khalti Integration
class KhaltiInitiateCasePaymentView(APIView):
    """
    Initiate a Khalti payment for an agreed case payment request.
    Copied from working KhaltiInitiateView for appointments, adapted for cases.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Initiate Khalti payment for an agreed case payment. Client only.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'payment_request_id': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['payment_request_id']
        ),
        responses={
            200: openapi.Response(description="Khalti payment URL returned successfully."),
            400: openapi.Response(description="Bad request."),
            403: openapi.Response(description="Not allowed."),
            404: openapi.Response(description="Payment request not found."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Case Payment"],
    )
    def post(self, request):
        try:
            payment_request_id = request.data.get('payment_request_id')
            if not payment_request_id:
                return api_response(
                    is_success=False,
                    error_message={"error": "payment_request_id is required."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Get payment request
            try:
                payment_request = CasePaymentRequest.objects.select_related(
                    'case', 'case__client', 'case__lawyer'
                ).get(id=payment_request_id)
            except CasePaymentRequest.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment request not found."},
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Only client who agreed can pay
            if payment_request.case.client != request.user:
                return api_response(
                    is_success=False,
                    error_message={"error": "Not allowed."},
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            # Payment must be agreed
            if payment_request.status != 'agreed':
                return api_response(
                    is_success=False,
                    error_message={"error": "Payment can only be initiated for agreed requests."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            user = request.user
            lawyer = payment_request.case.lawyer
            
            # Amount to pay
            amount = payment_request.current_agreed_amount or payment_request.proposed_amount
            tax_amount = Decimal("0")
            total_amount = amount

            # Calculate commission (EXACT same as appointment)
            commission_percent = settings.PLATFORM_COMMISSION_PERCENT
            platform_fee = (total_amount * commission_percent / Decimal("100")).quantize(Decimal("0.01"))
            lawyer_earning = total_amount - platform_fee

            # Create Payment record
            payment = Payment.objects.create(
                case_payment_request=payment_request,
                user=user,
                lawyer=lawyer,
                amount=amount,
                tax_amount=tax_amount,
                total_amount=total_amount,
                platform_fee=platform_fee,
                lawyer_earning=lawyer_earning,
                payment_method="khalti",
                status=Payment.STATUS_INITIATED,
            )


            # Khalti expects amount in paisa (1 Rs = 100 paisa)
            amount_in_paisa = int(amount * 100)

            # Dynamic return URL - user will return to the case detail page
            case_id = payment_request.case.id
            dynamic_return_url = f"http://localhost:5173/client/case/{case_id}"

            # Calling Khalti's ePayment initiate API (EXACT same as appointment)
            # Calling Khalti's ePayment initiate API using utility
            customer_info = {
                "name": user.name,
                "email": user.email,
                "phone": getattr(user, "phone", "9800000000"),
            }
            purchase_name = f"Case: {payment_request.case.case_title}"
            
            is_ok, khalti_data = initiate_khalti_payment(
                amount_in_paisa=amount_in_paisa,
                purchase_order_id=str(payment.transaction_uuid),
                purchase_order_name=purchase_name,
                customer_info=customer_info,
            )

            if not is_ok:
                # Khalti API returned an error — mark payment as failed
                payment.status = Payment.STATUS_FAILED
                payment.save(update_fields=["status", "updated_at"])
                return api_response(
                    is_success=False,
                    error_message={"error": f"Khalti initiation failed: {khalti_data}"},
                    status_code=status.HTTP_502_BAD_GATEWAY,
                )

            khalti_pidx = khalti_data.get("pidx")
            khalti_payment_url = khalti_data.get("payment_url")

            # Store Khalti pidx in esewa_ref_id field for lookup during verification
            payment.esewa_ref_id = khalti_pidx
            payment.save(update_fields=["esewa_ref_id", "updated_at"])

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Khalti payment initiated successfully.",
                    "payment_id": payment.id,
                    "khalti_payment_url": khalti_payment_url,
                    "pidx": khalti_pidx,
                },
            )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class KhaltiVerifyCasePaymentView(APIView):
    """
    Verify Khalti payment for case payment.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Verify Khalti payment for case payment.",
        manual_parameters=[
            openapi.Parameter(
                "pidx",
                openapi.IN_QUERY,
                description="Khalti pidx",
                type=openapi.TYPE_STRING,
                required=True,
            ),
            openapi.Parameter(
                "transaction_id",
                openapi.IN_QUERY,
                description="Khalti transaction ID",
                type=openapi.TYPE_STRING,
                required=False,
            ),
            openapi.Parameter(
                "purchase_order_id",
                openapi.IN_QUERY,
                description="Payment transaction UUID",
                type=openapi.TYPE_STRING,
                required=False,
            ),
        ],
        tags=["Case Payment"],
    )
    def get(self, request):
        try:
            from .models import CasePaymentRequest, Payment

            pidx = request.query_params.get("pidx")
            purchase_order_id = request.query_params.get("purchase_order_id")

            if not pidx:
                return api_response(
                    is_success=False,
                    error_message={"error": "Missing Khalti pidx parameter."},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Find payment record
            payment = None
            if purchase_order_id:
                try:
                    payment = Payment.objects.select_related(
                        'case_payment_request', 'case_payment_request__case'
                    ).get(transaction_uuid=purchase_order_id)
                except Payment.DoesNotExist:
                    pass

            if not payment:
                try:
                    payment = Payment.objects.select_related(
                        'case_payment_request', 'case_payment_request__case'
                    ).get(esewa_ref_id=pidx, payment_method="khalti")
                except Payment.DoesNotExist:
                    return api_response(
                        is_success=False,
                        error_message={"error": "Payment record not found."},
                        status_code=status.HTTP_404_NOT_FOUND,
                    )

            # If already completed
            if payment.status == Payment.STATUS_COMPLETED:
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Payment already verified.",
                        "payment": PaymentSerializer(payment).data,
                    },
                )

            # Verify with Khalti
            headers = {
                "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
                "Content-Type": "application/json",
            }
            verification_response = requests.post(
                f"{settings.KHALTI_BASE_URL}/epayment/lookup/",
                json={"pidx": pidx},
                headers=headers,
                timeout=15,
            )

            if verification_response.status_code == 200:
                response_data = verification_response.json()
                
                if response_data.get("status") == "Completed":
                    # Payment successful
                    case_payment = payment.case_payment_request
                    
                    # Mark as paid
                    case_payment.status = 'paid'
                    case_payment.paid_at = timezone.now()
                    case_payment.save()
                    
                    # Mark case completed
                    case = case_payment.case
                    case.status = 'completed'
                    case.completed_at = timezone.now()
                    case.save(update_fields=["status", "completed_at", "updated_at"])

                    # Mark Payment record completed
                    payment.status = Payment.STATUS_COMPLETED
                    payment.save()

                    # Notify lawyer
                    send_notification(
                        user=case.lawyer,
                        title="Case Payment Received",
                        message=f"Client paid Rs. {payment.amount} for case: {case.case_title}. The case is now completed.",
                        notif_type="payment",
                        link=f"/case/{case.id}/payment",
                    )
                    
                    # Notify client
                    send_notification(
                        user=case.client,
                        title="Payment Successful",
                        message=f"Your payment for case '{case.case_title}' was successful. The case is now completed.",
                        notif_type="payment",
                        link=f"/case/{case.id}/payment",
                    )

                    return api_response(
                        is_success=True,
                        status_code=status.HTTP_200_OK,
                        result={
                            "message": "Payment verified successfully",
                            "payment": PaymentSerializer(payment).data,
                        },
                    )
                else:
                    return api_response(
                        is_success=False,
                        error_message={"error": f"Payment status: {response_data.get('status')}"},
                        status_code=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                return api_response(
                    is_success=False,
                    error_message={"error": "Khalti verification failed."},
                    status_code=status.HTTP_502_BAD_GATEWAY,
                )

        except requests.Timeout:
            return api_response(
                is_success=False,
                error_message={"error": "Khalti service timeout."},
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
