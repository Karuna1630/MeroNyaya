import base64
import json
import requests

from decimal import Decimal
from django.conf import settings
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

from .models import Payment, Payout
from .serializers import PaymentSerializer, EsewaInitiateSerializer, KhaltiInitiateSerializer, PayoutSerializer, CreatePayoutSerializer
import hmac as hmac_compare
from .utils import generate_esewa_signature, build_esewa_signature_message


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

            # Generating HMAC-SHA256 signature for eSewa verification
            message = build_esewa_signature_message(
                total_amount=str(total_amount),
                transaction_uuid=str(payment.transaction_uuid),
            )
            signature = generate_esewa_signature(message)

            # Building eSewa form parameters for frontend to submit
            esewa_params = {
                "amount": str(amount),
                "tax_amount": str(tax_amount),
                "total_amount": str(total_amount),
                "transaction_uuid": str(payment.transaction_uuid),
                "product_code": settings.ESEWA_PRODUCT_CODE,
                "product_service_charge": "0",
                "product_delivery_charge": "0",
                "success_url": settings.ESEWA_SUCCESS_URL,
                "failure_url": settings.ESEWA_FAILURE_URL,
                "signed_field_names": "total_amount,transaction_uuid,product_code",
                "signature": signature,
            }

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

            # Verifying with eSewa's transaction status API (with signature fallback)
            esewa_transaction_status = None
            esewa_ref = esewa_ref_id

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
                verify_data = verify_response.json()
                esewa_transaction_status = verify_data.get("status")
                esewa_ref = verify_data.get("ref_id", esewa_ref_id)
            except Exception:
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

            # Calling Khalti's ePayment initiate API
            khalti_payload = {
                "return_url": settings.KHALTI_RETURN_URL,
                "website_url": settings.KHALTI_WEBSITE_URL,
                "amount": amount_in_paisa,
                "purchase_order_id": str(payment.transaction_uuid),
                "purchase_order_name": f"Consultation - {lawyer.name}",
                "customer_info": {
                    "name": user.name,
                    "email": user.email,
                    "phone": getattr(user, "phone", "9800000000"),
                },
            }

            khalti_response = requests.post(
                f"{settings.KHALTI_BASE_URL}/epayment/initiate/",
                json=khalti_payload,
                headers={
                    "Authorization": f"key {settings.KHALTI_SECRET_KEY}",
                    "Content-Type": "application/json",
                },
                timeout=30,
            )

            if khalti_response.status_code != 200:
                # Khalti API returned an error — mark payment as failed
                payment.status = Payment.STATUS_FAILED
                payment.save(update_fields=["status", "updated_at"])
                error_detail = khalti_response.json() if khalti_response.text else "Unknown Khalti error"
                return api_response(
                    is_success=False,
                    error_message={"error": f"Khalti initiation failed: {error_detail}"},
                    status_code=status.HTTP_502_BAD_GATEWAY,
                )

            khalti_data = khalti_response.json()
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

            # Calling Khalti's lookup API to verify the payment
            try:
                lookup_response = requests.post(
                    f"{settings.KHALTI_BASE_URL}/epayment/lookup/",
                    json={"pidx": pidx},
                    headers={
                        "Authorization": f"key {settings.KHALTI_SECRET_KEY}",
                        "Content-Type": "application/json",
                    },
                    timeout=15,
                )
                lookup_data = lookup_response.json()
            except Exception:
                return api_response(
                    is_success=False,
                    error_message={"error": "Khalti verification service unreachable."},
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
            payments = Payment.objects.filter(user=request.user)
            serializer = PaymentSerializer(payments, many=True)
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Payments retrieved successfully.",
                    "payments": serializer.data,
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

            # Payout history for this lawyer
            payouts = Payout.objects.filter(lawyer=user).select_related("processed_by")
            payout_serializer = PayoutSerializer(payouts, many=True)

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Earnings retrieved successfully.",
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
                    "lawyer_breakdown": list(lawyer_breakdown),
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
