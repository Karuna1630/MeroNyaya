from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Consultation
from .serializers import ConsultationSerializer


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
		return Response(self.get_serializer(consultation).data)

	@action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
	def reject(self, request, pk=None):
		consultation = self.get_object()
		if consultation.lawyer != request.user:
			return Response({"detail": "Only the assigned lawyer can reject."}, status=status.HTTP_403_FORBIDDEN)

		consultation.status = Consultation.STATUS_REJECTED
		consultation.save(update_fields=["status", "updated_at"])
		return Response(self.get_serializer(consultation).data)
