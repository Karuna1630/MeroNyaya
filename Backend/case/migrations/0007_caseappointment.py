from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("case", "0006_casetimeline"),
        ("authentication", "0004_user_is_kyc_verified"),
    ]

    operations = [
        migrations.CreateModel(
            name="CaseAppointment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(help_text="Appointment title", max_length=200)),
                ("mode", models.CharField(choices=[("video", "Video"), ("in_person", "In Person")], default="video", max_length=20)),
                ("preferred_day", models.CharField(max_length=10)),
                ("preferred_time", models.CharField(max_length=20)),
                ("meeting_location", models.CharField(blank=True, max_length=255, null=True)),
                ("phone_number", models.CharField(blank=True, max_length=30, null=True)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("confirmed", "Confirmed"), ("rescheduled", "Rescheduled"), ("completed", "Completed"), ("cancelled", "Cancelled")], default="pending", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("case", models.ForeignKey(help_text="Case this appointment belongs to", on_delete=django.db.models.deletion.CASCADE, related_name="appointments", to="case.case")),
                ("client", models.ForeignKey(help_text="Client who scheduled the appointment", limit_choices_to={"role": "Client"}, on_delete=django.db.models.deletion.CASCADE, related_name="case_appointments", to="authentication.user")),
                ("lawyer", models.ForeignKey(blank=True, help_text="Lawyer assigned to the case", limit_choices_to={"role": "Lawyer"}, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="case_appointments_assigned", to="authentication.user")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
