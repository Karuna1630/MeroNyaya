from django.db import models
from consultation.models import Consultation


class Appointment(models.Model):
	STATUS_PENDING = "pending"
	STATUS_CONFIRMED = "confirmed"
	STATUS_RESCHEDULED = "rescheduled"
	STATUS_COMPLETED = "completed"
	STATUS_CANCELLED = "cancelled"

	STATUS_CHOICES = [
		(STATUS_PENDING, "Pending"),
		(STATUS_CONFIRMED, "Confirmed"),
		(STATUS_RESCHEDULED, "Rescheduled"),
		(STATUS_COMPLETED, "Completed"),
		(STATUS_CANCELLED, "Cancelled"),
	]

	consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name="appointments")
	scheduled_date = models.DateField(null=True, blank=True)
	scheduled_time = models.TimeField(null=True, blank=True)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
	notes = models.TextField(blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return f"Appointment #{self.id} for Consultation #{self.consultation_id}"
