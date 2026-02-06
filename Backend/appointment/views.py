from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils.dateparse import parse_date, parse_time

from .models import Appointment
from .serializers import AppointmentSerializer
from consultation.models import Consultation


class AppointmentViewSet(viewsets.ModelViewSet):
	serializer_class = AppointmentSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
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

	@action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
	def pay(self, request, pk=None):
		appointment = self.get_object()
		user = request.user

		if appointment.consultation.client != user:
			return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

		if appointment.consultation.mode != Consultation.MODE_VIDEO:
			return Response({"detail": "Payment is only required for video consultations."}, status=status.HTTP_400_BAD_REQUEST)

		appointment.payment_status = Appointment.PAYMENT_PAID
		appointment.status = Appointment.STATUS_CONFIRMED
		appointment.save(update_fields=["payment_status", "status", "updated_at"])
		serializer = self.get_serializer(appointment)
		return Response(serializer.data, status=status.HTTP_200_OK)
