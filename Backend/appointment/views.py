from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
	serializer_class = AppointmentSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		queryset = Appointment.objects.all()

		if user.is_superuser or user.is_staff:
			return queryset

		if user.is_lawyer:
			return queryset.filter(consultation__lawyer=user)

		return queryset.filter(consultation__client=user)
