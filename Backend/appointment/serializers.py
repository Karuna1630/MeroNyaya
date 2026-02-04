from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
	class Meta:
		model = Appointment
		fields = [
			"id",
			"consultation",
			"scheduled_date",
			"scheduled_time",
			"status",
			"notes",
			"created_at",
			"updated_at",
		]
		read_only_fields = ["status", "created_at", "updated_at"]
