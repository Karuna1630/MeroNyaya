from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.dateparse import parse_date, parse_time

from .models import Appointment
from .serializers import AppointmentSerializer
from consultation.models import Consultation
from notification.utils import send_notification


class AppointmentListCreateView(generics.ListCreateAPIView):
    """
    List all appointments or create a new one.
    GET /api/appointments/
    POST /api/appointments/
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()
        queryset = Appointment.objects.all()

        if user.is_superuser or user.is_staff:
            return queryset

        if user.is_lawyer:
            appointments = queryset.filter(consultation__lawyer=user)
            accepted_consultations = Consultation.objects.filter(
                lawyer=user,
                status=Consultation.STATUS_ACCEPTED,
            )
            for consultation in accepted_consultations:
                defaults = {
                    "scheduled_date": parse_date(consultation.scheduled_date) if consultation.scheduled_date else None,
                    "scheduled_time": parse_time(consultation.scheduled_time) if consultation.scheduled_time else None,
                }
                # Set payment status based on mode
                if consultation.mode == "in_person":
                    defaults["payment_status"] = Appointment.PAYMENT_IN_HAND
                else:
                    defaults["payment_status"] = Appointment.PAYMENT_PENDING

                Appointment.objects.get_or_create(
                    consultation=consultation,
                    defaults=defaults,
                )
            return appointments

        appointments = queryset.filter(consultation__client=user)
        accepted_consultations = Consultation.objects.filter(
            client=user,
            status=Consultation.STATUS_ACCEPTED,
        )
        for consultation in accepted_consultations:
            defaults = {
                "scheduled_date": parse_date(consultation.scheduled_date) if consultation.scheduled_date else None,
                "scheduled_time": parse_time(consultation.scheduled_time) if consultation.scheduled_time else None,
            }
            # Set payment status based on mode
            if consultation.mode == "in_person":
                defaults["payment_status"] = Appointment.PAYMENT_IN_HAND
            else:
                defaults["payment_status"] = Appointment.PAYMENT_PENDING

            Appointment.objects.get_or_create(
                consultation=consultation,
                defaults=defaults,
            )
        return appointments


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific appointment.
    GET/PUT/PATCH/DELETE /api/appointments/<pk>/
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff:
            return Appointment.objects.all()
        if user.is_lawyer:
            return Appointment.objects.filter(consultation__lawyer=user)
        return Appointment.objects.filter(consultation__client=user)


class AppointmentPayView(APIView):
    """
    Process payment for a video consultation appointment.
    POST /api/appointments/<pk>/pay/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({"detail": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        if appointment.consultation.client != user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        if appointment.consultation.mode != Consultation.MODE_VIDEO:
            return Response({"detail": "Payment is only required for video consultations."}, status=status.HTTP_400_BAD_REQUEST)

        appointment.payment_status = Appointment.PAYMENT_PAID
        appointment.status = Appointment.STATUS_CONFIRMED
        appointment.save(update_fields=["payment_status", "status", "updated_at"])

        # Notify lawyer that payment was received
        send_notification(
            user=appointment.consultation.lawyer,
            title='Payment Received',
            message=f'{user.name} has paid for the consultation appointment',
            notif_type='payment',
            link='/lawyerappointment'
        )

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_200_OK)
