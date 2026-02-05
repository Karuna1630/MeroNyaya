from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
	list_display = (
		"id",
		"consultation",
		"scheduled_date",
		"scheduled_time",
		"status",
		"created_at",
	)
	list_filter = ("status", "scheduled_date", "created_at")
	search_fields = (
		"consultation__id",
		"consultation__client__name",
		"consultation__lawyer__name",
	)
	ordering = ("-created_at",)
	readonly_fields = ("created_at", "updated_at")

	fieldsets = (
		("Appointment Info", {"fields": ("consultation", "status")}),
		("Schedule", {"fields": ("scheduled_date", "scheduled_time")}),
		("Notes", {"fields": ("notes",)}),
		("Timestamps", {"fields": ("created_at", "updated_at")}),
	)
