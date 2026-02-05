from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_date, parse_time

from .models import Consultation
from .serializers import ConsultationSerializer
from appointment.models import Appointment


class ConsultationViewSet(viewsets.ModelViewSet):
	serializer_class = ConsultationSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		queryset = Consultation.objects.all()

		if user.is_superuser or user.is_staff:
			return queryset

		if user.is_lawyer:
			return queryset.filter(lawyer=user)

		return queryset.filter(client=user)

	def perform_create(self, serializer):
		serializer.save(client=self.request.user)

	@action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
	def accept(self, request, pk=None):
		consultation = self.get_object()
		if consultation.lawyer != request.user:
			return Response({"detail": "Only the assigned lawyer can accept."}, status=status.HTTP_403_FORBIDDEN)

		consultation.status = Consultation.STATUS_ACCEPTED
		consultation.save(update_fields=["status", "updated_at"])

		appointment_defaults = {}
		if consultation.scheduled_date:
			appointment_defaults["scheduled_date"] = parse_date(consultation.scheduled_date)
		if consultation.scheduled_time:
			appointment_defaults["scheduled_time"] = parse_time(consultation.scheduled_time)
		
		# Set payment status based on consultation mode
		if consultation.mode == "in_person":
			appointment_defaults["payment_status"] = Appointment.PAYMENT_IN_HAND
		else:
			appointment_defaults["payment_status"] = Appointment.PAYMENT_PENDING

		Appointment.objects.get_or_create(
			consultation=consultation,
			defaults=appointment_defaults,
		)
		return Response(self.get_serializer(consultation).data)

	@action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
	def reject(self, request, pk=None):
		consultation = self.get_object()
		if consultation.lawyer != request.user:
			return Response({"detail": "Only the assigned lawyer can reject."}, status=status.HTTP_403_FORBIDDEN)

		consultation.status = Consultation.STATUS_REJECTED
		consultation.save(update_fields=["status", "updated_at"])
		return Response(self.get_serializer(consultation).data)

	@action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
	def complete(self, request, pk=None):
		consultation = self.get_object()
		# Allow both lawyer and client to mark as complete
		if consultation.lawyer != request.user and consultation.client != request.user:
			return Response({"detail": "Only the lawyer or client can mark this as complete."}, status=status.HTTP_403_FORBIDDEN)

		if consultation.status != Consultation.STATUS_ACCEPTED:
			return Response({"detail": "Only accepted consultations can be marked as complete."}, status=status.HTTP_400_BAD_REQUEST)

		consultation.status = Consultation.STATUS_COMPLETED
		consultation.save(update_fields=["status", "updated_at"])
		
		# Update associated appointment status if exists
		try:
			appointment = Appointment.objects.get(consultation=consultation)
			appointment.status = Appointment.STATUS_COMPLETED
			appointment.save(update_fields=["status"])
		except Appointment.DoesNotExist:
			pass
		
		return Response(self.get_serializer(consultation).data)
