from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("case", "0007_caseappointment"),
    ]

    operations = [
        migrations.AddField(
            model_name="caseappointment",
            name="meeting_link",
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name="caseappointment",
            name="scheduled_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="caseappointment",
            name="scheduled_time",
            field=models.TimeField(blank=True, null=True),
        ),
    ]
