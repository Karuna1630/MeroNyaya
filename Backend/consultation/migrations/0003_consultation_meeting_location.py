from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("consultation", "0002_update_mode_choices"),
    ]

    operations = [
        migrations.AddField(
            model_name="consultation",
            name="meeting_location",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
