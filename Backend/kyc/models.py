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
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    dob = models.DateField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    permanent_address = models.TextField()
    current_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ProfessionalInfo(models.Model):
    kyc = models.OneToOneField(LawyerKYC, on_delete=models.CASCADE, related_name='professional_info')
    bar_council_number = models.CharField(max_length=100, unique=True)
    law_firm_name = models.CharField(max_length=255, blank=True, null=True)
    years_of_experience = models.CharField(max_length=50)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    specializations = models.JSONField(default=list)
    availability_days = models.JSONField(default=list)
    available_from = models.TimeField()
    available_until = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class IdentityDocuments(models.Model):
    kyc = models.OneToOneField(LawyerKYC, on_delete=models.CASCADE, related_name='identity_documents')
    citizenship_front = models.FileField(upload_to='kyc/documents/')
    citizenship_back = models.FileField(upload_to='kyc/documents/')
    lawyer_license = models.FileField(upload_to='kyc/documents/')
    passport_photo = models.FileField(upload_to='kyc/documents/')
    law_degree = models.FileField(upload_to='kyc/documents/')
    experience_certificate = models.FileField(upload_to='kyc/documents/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Declaration(models.Model):
    kyc = models.OneToOneField(LawyerKYC, on_delete=models.CASCADE, related_name='declaration')
    confirm_accuracy = models.BooleanField(default=False)
    authorize_verification = models.BooleanField(default=False)
    agree_terms = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
