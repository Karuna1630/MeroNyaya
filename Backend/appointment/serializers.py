from rest_framework import serializers
from .models import Appointment
from consultation.serializers import ConsultationSerializer


class AppointmentSerializer(serializers.ModelSerializer):
	consultation_details = ConsultationSerializer(source="consultation", read_only=True)

	class Meta:
		model = Appointment
		fields = [
			"id",
			"consultation",
			"consultation_details",
			"scheduled_date",
			"scheduled_time",
			"status",
			"payment_status",
			"notes",
			"created_at",
			"updated_at",
		]
		read_only_fields = ["status", "created_at", "updated_at"]
