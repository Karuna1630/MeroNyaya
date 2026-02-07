from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager

# Creating a custom user model to support both lawyers and clients with email as the unique identifier.

class User(AbstractUser):
    class UserRoles(models.TextChoices):
        LAWYER = "Lawyer", _("Lawyer")
        CLIENT = "Client", _("Client")
        SUPERADMIN = "SuperAdmin", _("SuperAdmin")

    username = None  
    first_name = None
    last_name = None
    email = models.EmailField(_('email address'), unique=True)
    # Common fields
    name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    
    is_verified = models.BooleanField(default=False)
    is_kyc_verified = models.BooleanField(default=False)
    # Role-specific fields
    is_lawyer = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    #choice field to specify user role
    role = models.CharField(choices = UserRoles.choices, max_length=20, default=UserRoles.CLIENT)
    # Custom user manager for handling user creation
    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    # Override save method to auto-set user role everytime the user is saved based on the is_superuser and is_lawyer flags. This ensures that the role is always consistent with the user's status as a superadmin, lawyer, or client.
    def save(self, *args, **kwargs):
        # Determine role based on is_superuser 
        if self.is_superuser:
            self.role = self.UserRoles.SUPERADMIN
        # Determine role based on is_lawyer flag
        elif self.is_lawyer:
            self.role = self.UserRoles.LAWYER
        # Default to client role
        else:
            self.role = self.UserRoles.CLIENT
        super().save(*args, **kwargs)
  
    # String representation of the user for admin interface
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    # creating a property to get kyc status
    @property
    def kyc_status(self):
        """Get KYC status for lawyers"""
        # Only applicable for lawyers
        if not self.is_lawyer:
            return None
        try:
            return self.lawyer_kyc.status
        except:
            return 'not_submitted'
    
    # creating a property to get full name
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

# creating a model for OTP to handle email verification and password reset processes. 
class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    # creating meta class for how otps are named and ordered in admin and queries by created_at in descending order.
    class Meta:
        verbose_name = 'OTP'
        verbose_name_plural = 'OTPs'
        ordering = ['-created_at']

    # String representation of the OTP for admin interface to show email and otp value instead of default object representation.
    def __str__(self):
        return f"OTP for {self.email} - {self.otp} "
    
