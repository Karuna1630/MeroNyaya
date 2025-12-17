from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email
from django.utils.translation import gettext_lazy as _

from typing import Any

# Custom validator for email format
def validate_email(email: str) -> None:
    try:
        django_validate_email(email)
    except ValidationError:
        raise ValidationError(_("Invalid email format."))
    

# Custom user manager
class CustomUserManager(BaseUserManager):
    def _create_user(self, email, password= None, **extra_fields):
        if not email:
            raise ValueError(_("An email address is required."))
        
        if not password:
            raise ValueError(_("A password is required."))
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    # Creating superuser with elevated privileges
    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        # Ensureinsuring superuser has necessary privileges
        return self._create_user(email, password, **extra_fields)
    

    def create_superuser(self, email, password= None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        # Ensuring superuser has necessary privileges
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self._create_user(email, password, **extra_fields)   