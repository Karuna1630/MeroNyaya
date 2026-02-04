from django.contrib import admin
from .models import Consultation


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
	list_display = [
		"id",
		"client",
		"lawyer",
		"title",
		"mode",
		"status",
		"requested_day",
		"requested_time",
		"created_at",
	]
	list_filter = ["status", "mode", "created_at"]
	search_fields = ["client__name", "lawyer__name", "title", "meeting_location", "phone_number"]
	readonly_fields = ["id", "created_at", "updated_at"]
	fieldsets = (
		("Basic Info", {
			"fields": ("id", "client", "lawyer", "case")
		}),
		("Consultation Details", {
			"fields": ("title", "mode", "requested_day", "requested_time", "meeting_location", "phone_number")
		}),
		("Status", {
			"fields": ("status",)
		}),
		("Timestamps", {
			"fields": ("created_at", "updated_at"),
			"classes": ("collapse",)
		}),
	)

	def get_readonly_fields(self, request, obj=None):
		if obj:  # Editing an existing object
			return self.readonly_fields + ["client"]
		return self.readonly_fields
