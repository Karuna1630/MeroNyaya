from django.db import models
from authentication.models import User
from case.models import Case


class Consultation(models.Model):
	STATUS_REQUESTED = "requested"
	STATUS_ACCEPTED = "accepted"
	STATUS_REJECTED = "rejected"
	STATUS_COMPLETED = "completed"

	STATUS_CHOICES = [
		(STATUS_REQUESTED, "Requested"),
		(STATUS_ACCEPTED, "Accepted"),
		(STATUS_REJECTED, "Rejected"),
		(STATUS_COMPLETED, "Completed"),
	]

	MODE_VIDEO = "video"
	MODE_IN_PERSON = "in_person"

	MODE_CHOICES = [
		(MODE_VIDEO, "Video Call"),
		(MODE_IN_PERSON, "In-Person"),
	]

	client = models.ForeignKey(User, on_delete=models.CASCADE, related_name="consultations_made")
	lawyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="consultations_received")
	case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name="consultations")

	mode = models.CharField(max_length=20, choices=MODE_CHOICES, default=MODE_VIDEO)
	requested_day = models.CharField(max_length=20, blank=True, null=True)
	requested_time = models.CharField(max_length=20, blank=True, null=True)
	notes = models.TextField(blank=True, null=True)

	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_REQUESTED)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return f"Consultation #{self.id} - {self.client} -> {self.lawyer}"
