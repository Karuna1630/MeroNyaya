from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("consultation", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Appointment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("scheduled_date", models.DateField(blank=True, null=True)),
                ("scheduled_time", models.TimeField(blank=True, null=True)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("confirmed", "Confirmed"), ("rescheduled", "Rescheduled"), ("completed", "Completed"), ("cancelled", "Cancelled")], default="pending", max_length=20)),
                ("notes", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("consultation", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="appointments", to="consultation.consultation")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
