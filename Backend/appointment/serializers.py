from rest_framework import serializers
from .models import Appointment
from consultation.serializers import ConsultationSerializer


class AppointmentSerializer(serializers.ModelSerializer):
	consultation_details = ConsultationSerializer(source="consultation", read_only=True)
	is_rated = serializers.SerializerMethodField()

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
			"is_rated",
			"created_at",
			"updated_at",
		]
		read_only_fields = ["status", "created_at", "updated_at"]

	def get_is_rated(self, obj):
		"""
		Check if the current client has already rated the lawyer for this consultation context.
		Since uniqueness is enforced at client-lawyer-appointment level (one review per client per lawyer),
		we check if any review exists for this client and appointment.
		"""
		request = self.context.get("request")
		if not request or not request.user.is_authenticated:
			return False
		
		from review.models import Review
		exists = Review.objects.filter(
			client=request.user,
			appointment_id=obj.id
		).exists()
		if exists:
			print(f"DEBUG: Appointment {obj.id} is rated for user {request.user.id}")
		return exists
