from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("authentication", "0004_user_is_kyc_verified"),
        ("case", "0006_casetimeline"),
    ]

    operations = [
        migrations.CreateModel(
            name="Consultation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("mode", models.CharField(choices=[("video", "Video Call"), ("phone", "Phone Call"), ("message", "Message"), ("in_person", "In-Person")], default="video", max_length=20)),
                ("requested_day", models.CharField(blank=True, max_length=20, null=True)),
                ("requested_time", models.CharField(blank=True, max_length=20, null=True)),
                ("notes", models.TextField(blank=True, null=True)),
                ("status", models.CharField(choices=[("requested", "Requested"), ("accepted", "Accepted"), ("rejected", "Rejected"), ("completed", "Completed")], default="requested", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("case", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="consultations", to="case.case")),
                ("client", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="consultations_made", to="authentication.user")),
                ("lawyer", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="consultations_received", to="authentication.user")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
