from django.db import models
from django.utils.translation import gettext_lazy as _
from authentication.models import User


class Case(models.Model):
    """
    Model for storing legal cases submitted by clients
    """
    
    # Case Status Choices
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('public', 'Public - Open for Lawyers'),
        ('sent_to_lawyers', 'Sent to Specific Lawyer'),
        ('proposals_received', 'Proposals Received'),
        ('accepted', 'Accepted by Lawyer'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    ]
    
    # Urgency Level Choices
    URGENCY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    
    # Category Choices
    CATEGORY_CHOICES = [
        ('Family Law', 'Family Law'),
        ('Property Law', 'Property Law'),
        ('Criminal Law', 'Criminal Law'),
        ('Corporate Law', 'Corporate Law'),
        ('Civil Litigation', 'Civil Litigation'),
        ('Banking & Finance', 'Banking & Finance'),
        ('Labor Law', 'Labor Law'),
        ('Immigration Law', 'Immigration Law'),
        ('Insurance Law', 'Insurance Law'),
        ('Tort Law', 'Tort Law'),
    ]
    
    # Relationships
    client = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='cases_submitted',
        limit_choices_to={'role': 'Client'},
        help_text="Client who submitted the case"
    )
    lawyer = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        related_name='cases_assigned',
        limit_choices_to={'role': 'Lawyer'},
        null=True,
        blank=True,
        help_text="Lawyer assigned to the case"
    )
    
    # Case Information
    case_title = models.CharField(
        max_length=200, 
        help_text="Brief title of the legal case"
    )
    case_category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES,
        help_text="Category of legal issue"
    )
    case_description = models.TextField(
        max_length=2000,
        help_text="Detailed description of the legal issue"
    )
    
    # Case Settings
    urgency_level = models.CharField(
        max_length=10, 
        choices=URGENCY_CHOICES,
        default='Medium',
        help_text="Urgency level of the case"
    )
    lawyer_selection = models.CharField(
        max_length=10,
        choices=[('specific', 'Specific Lawyer'), ('public', 'Public for All Lawyers')],
        default='public',
        help_text="Whether case is public or sent to specific lawyer"
    )
    request_consultation = models.BooleanField(
        default=False,
        help_text="Whether client requested a consultation"
    )
    
    # Status & Metadata
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES,
        default='public',
        help_text="Current status of the case"
    )
    proposal_count = models.IntegerField(
        default=0,
        help_text="Number of proposals received from lawyers"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When the case was accepted by a lawyer"
    )
    completed_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When the case was marked as completed"
    )
    
    # Additional Information
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text="Reason if case was rejected"
    )
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Additional notes or updates about the case"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Case')
        verbose_name_plural = _('Cases')
        indexes = [
            models.Index(fields=['client', '-created_at']),
            models.Index(fields=['lawyer', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['case_category']),
        ]
    
    def __str__(self):
        return f"{self.case_title} - {self.client.name}"
    
    @property
    def is_open(self):
        """Check if case is still open for proposals"""
        return self.status in ['public', 'sent_to_lawyers', 'proposals_received']
    
    @property
    def is_active(self):
        """Check if case is currently being worked on"""
        return self.status in ['accepted', 'in_progress']


class CaseDocument(models.Model):
    """
    Model for storing documents uploaded for a case
    """
    case = models.ForeignKey(
        Case, 
        on_delete=models.CASCADE, 
        related_name='documents',
        help_text="Case this document belongs to"
    )
    file = models.FileField(
        upload_to='case/documents/%Y/%m/%d/',
        help_text="Uploaded document file"
    )
    file_name = models.CharField(
        max_length=255,
        help_text="Original name of the file"
    )
    file_type = models.CharField(
        max_length=10,
        help_text="File extension (pdf, jpg, png)"
    )
    file_size = models.IntegerField(
        help_text="File size in bytes"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = _('Case Document')
        verbose_name_plural = _('Case Documents')
    
    def __str__(self):
        return f"{self.file_name} - {self.case.case_title}"
