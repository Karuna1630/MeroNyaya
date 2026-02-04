from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("consultation", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="consultation",
            name="mode",
            field=models.CharField(choices=[("video", "Video Call"), ("in_person", "In-Person")], default="video", max_length=20),
        ),
    ]
