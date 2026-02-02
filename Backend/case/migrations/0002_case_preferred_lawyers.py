from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('case', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='case',
            name='preferred_lawyers',
            field=models.ManyToManyField(blank=True, help_text='Preferred lawyers selected by the client', limit_choices_to={'role': 'Lawyer'}, related_name='cases_preferred', to=settings.AUTH_USER_MODEL),
        ),
    ]
