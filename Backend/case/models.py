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
        ('Criminal Law', 'Criminal Law'),
        ('Civil Law', 'Civil Law'),
        ('Family Law', 'Family Law'),
        ('Property Law', 'Property Law'),
        ('Corporate Law', 'Corporate Law'),
        ('Labor Law', 'Labor Law'),
        ('Constitutional Law', 'Constitutional Law'),
        ('Environmental Law', 'Environmental Law'),
        ('Tax Law', 'Tax Law'),
        ('Immigration Law', 'Immigration Law'),
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
    preferred_lawyers = models.ManyToManyField(
        User,
        related_name='cases_preferred',
        limit_choices_to={'role': 'Lawyer'},
        blank=True,
        help_text="Preferred lawyers selected by the client"
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
    
    # Lawyer-Updated Information
    case_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Official case number assigned by court"
    )
    court_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Name of the court handling this case"
    )
    opposing_party = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Name of the opposing party in the case"
    )
    next_hearing_date = models.DateField(
        blank=True,
        null=True,
        help_text="Date of the next scheduled hearing"
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


class CaseAppointment(models.Model):
    """
    Model for storing case-specific appointments (no payment required)
    """

    MODE_VIDEO = "video"
    MODE_IN_PERSON = "in_person"

    MODE_CHOICES = [
        (MODE_VIDEO, "Video"),
        (MODE_IN_PERSON, "In Person"),
    ]

    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_RESCHEDULED = "rescheduled"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_RESCHEDULED, "Rescheduled"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="appointments",
        help_text="Case this appointment belongs to",
    )
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="case_appointments",
        limit_choices_to={'role': 'Client'},
        help_text="Client who scheduled the appointment",
    )
    lawyer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="case_appointments_assigned",
        limit_choices_to={'role': 'Lawyer'},
        null=True,
        blank=True,
        help_text="Lawyer assigned to the case",
    )
    title = models.CharField(max_length=200, help_text="Appointment title")
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default=MODE_VIDEO)
    preferred_day = models.CharField(max_length=10)
    preferred_time = models.CharField(max_length=20)
    meeting_location = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    scheduled_date = models.DateField(null=True, blank=True)
    scheduled_time = models.TimeField(null=True, blank=True)
    meeting_link = models.URLField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Case Appointment #{self.id} for Case #{self.case_id}"


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
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User who uploaded the document"
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


class CaseTimeline(models.Model):
    """
    Model for storing case timeline events and updates
    """
    EVENT_TYPE_CHOICES = [
        ('case_created', 'Case Created'),
        ('case_accepted', 'Case Accepted'),
        ('status_changed', 'Status Changed'),
        ('document_uploaded', 'Document Uploaded'),
        ('hearing_scheduled', 'Hearing Scheduled'),
        ('note_added', 'Note Added'),
        ('case_updated', 'Case Updated'),
    ]
    
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='timeline',
        help_text="Case this timeline event belongs to"
    )
    event_type = models.CharField(
        max_length=20,
        choices=EVENT_TYPE_CHOICES,
        help_text="Type of timeline event"
    )
    title = models.CharField(
        max_length=200,
        help_text="Title of the event"
    )
    description = models.TextField(
        help_text="Description of the event"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User who created this event"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Case Timeline')
        verbose_name_plural = _('Case Timeline')
    
    def __str__(self):
        return f"{self.title} - {self.case.case_title}"
