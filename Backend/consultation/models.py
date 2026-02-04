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

	title = models.CharField(max_length=255, blank=False, null=False, default="")
	mode = models.CharField(max_length=20, choices=MODE_CHOICES, default=MODE_VIDEO)
	requested_day = models.CharField(max_length=20, blank=True, null=True)
	requested_time = models.CharField(max_length=20, blank=True, null=True)
	meeting_location = models.CharField(max_length=255, blank=False, null=False, default="")
	phone_number = models.CharField(max_length=20, blank=False, null=False, default="")
	
	# Scheduled appointment fields (filled by lawyer when accepting video consultations)
	scheduled_date = models.CharField(max_length=20, blank=True, null=True, help_text="Date scheduled by lawyer")
	scheduled_time = models.CharField(max_length=20, blank=True, null=True, help_text="Time scheduled by lawyer")
	meeting_link = models.CharField(max_length=500, blank=True, null=True, help_text="Video meeting link (for video consultations)")
	
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_REQUESTED)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def clean(self):
		if not self.meeting_location or not self.meeting_location.strip():
			from django.core.exceptions import ValidationError
			raise ValidationError("Meeting location is required for all consultations.")
		if not self.title or not self.title.strip():
			from django.core.exceptions import ValidationError
			raise ValidationError("Consultation title is required.")

	def __str__(self):
		return f"Consultation #{self.id} - {self.client} -> {self.lawyer}"
