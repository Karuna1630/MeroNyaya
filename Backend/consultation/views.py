from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_date, parse_time
from case.models import Case

from .models import Consultation
from .serializers import ConsultationSerializer
from appointment.models import Appointment
from notification.utils import send_notification


class ConsultationViewSet(viewsets.ModelViewSet):
	serializer_class = ConsultationSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		if getattr(self, 'swagger_fake_view', False):
			return Consultation.objects.none()

		user = self.request.user
		if not user.is_authenticated:
			return Consultation.objects.none()
		queryset = Consultation.objects.all()

		if user.is_superuser or user.is_staff:
			return queryset

		if user.is_lawyer:
			return queryset.filter(lawyer=user)

		return queryset.filter(client=user)

	def create(self, request, *args, **kwargs):
		"""
		Create a consultation with validation for case status
		"""
		case_id = request.data.get('case_id')
		lawyer_id = request.data.get('lawyer_id')

		# If a case is specified, validate that it's been accepted
		if case_id:
			try:
				case = Case.objects.get(id=case_id)
				
				# Case must be accepted by a lawyer
				if case.status != 'accepted':
					return Response(
						{"detail": f"Can only create consultation for accepted cases. Current status: {case.status}"},
						status=status.HTTP_400_BAD_REQUEST
					)
				
				# The lawyer specified must be the one assigned to the case
				if case.lawyer_id != int(lawyer_id):
					return Response(
						{"detail": "The specified lawyer must be the one assigned to this case"},
						status=status.HTTP_403_FORBIDDEN
					)
			except Case.DoesNotExist:
				return Response(
					{"detail": "Case not found"},
					status=status.HTTP_404_NOT_FOUND
				)
		
		# Proceed with normal creation
		return super().create(request, *args, **kwargs)

	def perform_create(self, serializer):
		consultation = serializer.save(client=self.request.user)

		# Notify the lawyer about new consultation request
		send_notification(
			user=consultation.lawyer,
			title='New Consultation Request',
			message=f'{self.request.user.name} requested a consultation with you',
			notif_type='appointment'
		)

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

		appointment, created = Appointment.objects.get_or_create(
			consultation=consultation,
			defaults=appointment_defaults,
		)

		# Keep appointment in sync when it already exists.
		if not created:
			for key, value in appointment_defaults.items():
				setattr(appointment, key, value)

		if consultation.mode == "in_person":
			appointment.status = Appointment.STATUS_CONFIRMED
		else:
			appointment.status = Appointment.STATUS_PENDING
		appointment.save(update_fields=["scheduled_date", "scheduled_time", "payment_status", "status", "updated_at"])

		# Notify client that consultation was accepted
		send_notification(
			user=consultation.client,
			title='Consultation Accepted',
			message=f'Lawyer {request.user.name} accepted your consultation request',
			notif_type='appointment'
		)

		return Response(self.get_serializer(consultation).data)

	@action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
	def reject(self, request, pk=None):
		consultation = self.get_object()
		if consultation.lawyer != request.user:
			return Response({"detail": "Only the assigned lawyer can reject."}, status=status.HTTP_403_FORBIDDEN)

		consultation.status = Consultation.STATUS_REJECTED
		consultation.save(update_fields=["status", "updated_at"])

		# Notify client that consultation was rejected
		send_notification(
			user=consultation.client,
			title='Consultation Rejected',
			message=f'Lawyer {request.user.name} rejected your consultation request',
			notif_type='appointment'
		)

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
		
		# Notify the other party about completion
		notify_user = consultation.client if request.user == consultation.lawyer else consultation.lawyer
		send_notification(
			user=notify_user,
			title='Consultation Completed',
			message=f'Your consultation has been marked as completed',
			notif_type='appointment'
		)

		return Response(self.get_serializer(consultation).data)
