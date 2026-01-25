from django.db import models
from django.utils.translation import gettext_lazy as _
from authentication.models import User


class LawyerKYC(models.Model):
    """
    Comprehensive KYC model for lawyer verification
    """
    class KYCStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        APPROVED = 'approved', _('Approved')
        REJECTED = 'rejected', _('Rejected')
    
    class Gender(models.TextChoices):
        MALE = 'Male', _('Male')
        FEMALE = 'Female', _('Female')
        OTHER = 'Other', _('Other')
    
    # Relationship
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lawyer_kyc')
    
    # KYC Status
    status = models.CharField(max_length=10, choices=KYCStatus.choices, default=KYCStatus.PENDING)
    rejection_reason = models.TextField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    
    # Personal Information
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    dob = models.DateField()
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.FEMALE)
    permanent_address = models.TextField()
    current_address = models.TextField()
    
    # Professional Information
    bar_council_number = models.CharField(max_length=100, unique=True)
    law_firm_name = models.CharField(max_length=255, blank=True, null=True)
    years_of_experience = models.CharField(max_length=50)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    specializations = models.JSONField(default=list, blank=True)
    availability_days = models.JSONField(default=list, blank=True)
    available_from = models.TimeField(blank=True, null=True)
    available_until = models.TimeField(blank=True, null=True)
    
    # Identity Documents
    citizenship_front = models.FileField(upload_to='kyc/documents/citizenship/')
    citizenship_back = models.FileField(upload_to='kyc/documents/citizenship/')
    lawyer_license = models.FileField(upload_to='kyc/documents/license/')
    passport_photo = models.FileField(upload_to='kyc/documents/photos/')
    law_degree = models.FileField(upload_to='kyc/documents/degrees/')
    experience_certificate = models.FileField(upload_to='kyc/documents/experience/')
    
    # Declaration
    confirm_accuracy = models.BooleanField(default=False)
    authorize_verification = models.BooleanField(default=False)
    agree_terms = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Lawyer KYC')
        verbose_name_plural = _('Lawyer KYCs')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_status_display()}"
    
    @property
    def is_verified(self):
        """Check if KYC is approved"""
        return self.status == self.KYCStatus.APPROVED
    
    @property
    def all_declarations_agreed(self):
        """Check if all declarations are agreed"""
        return self.confirm_accuracy and self.authorize_verification and self.agree_terms
