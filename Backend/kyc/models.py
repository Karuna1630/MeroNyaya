from django.db import models
from authentication.models import User

class LawyerKYC(models.Model):
    KYC_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc')
    status = models.CharField(max_length=10, choices=KYC_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.status}"


class PersonalInfo(models.Model):
    kyc = models.OneToOneField(LawyerKYC, on_delete=models.CASCADE, related_name='personal_info')
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ProfessionalInfo(models.Model):
    kyc = models.OneToOneField(LawyerKYC, on_delete=models.CASCADE, related_name='professional_info')
    license_number = models.CharField(max_length=100, unique=True)
    bar_council_name = models.CharField(max_length=255)
    bar_council_registration = models.CharField(max_length=100)
    years_of_experience = models.IntegerField()
    specialization = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class IdentityDocuments(models.Model):
    DOC_TYPE_CHOICES = [
        ('passport', 'Passport'),
        ('national_id', 'National ID'),
        ('driving_license', 'Driving License'),
    ]
    
    kyc = models.OneToOneField(LawyerKYC, on_delete=models.CASCADE, related_name='identity_documents')
    document_type = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES)
    document_number = models.CharField(max_length=100)
    document_file = models.FileField(upload_to='kyc/identity_documents/')
    license_document = models.FileField(upload_to='kyc/license_documents/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Declaration(models.Model):
    kyc = models.OneToOneField(LawyerKYC, on_delete=models.CASCADE, related_name='declaration')
    agreed_to_terms = models.BooleanField(default=False)
    declared_accurate = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
