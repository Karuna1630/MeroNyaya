from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from authentication.models import User
from case.models import Case


class Proposal(models.Model):
    """
    Model for storing lawyer proposals for cases
    """
    
    # Proposal Status Choices
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('accepted', 'Accepted by Client'),
        ('rejected', 'Rejected by Client'),
        ('withdrawn', 'Withdrawn by Lawyer'),
    ]
    
    # Relationships
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='proposals',
        help_text="Case this proposal is for"
    )
    lawyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='proposals_submitted',
        limit_choices_to={'role': 'Lawyer'},
        help_text="Lawyer who submitted the proposal"
    )
    
    # Proposal Content
    proposal_text = models.TextField(
        max_length=2000,
        help_text="Lawyer's proposal text explaining their experience and approach"
    )
    
    # Status & Metadata
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current status of the proposal"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the proposal was reviewed by the client"
    )
    
    # Additional Information
    client_feedback = models.TextField(
        blank=True,
        null=True,
        help_text="Feedback from client if rejected"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Proposal')
        verbose_name_plural = _('Proposals')
        unique_together = ['case', 'lawyer']  # One proposal per lawyer per case
        indexes = [
            models.Index(fields=['case', '-created_at']),
            models.Index(fields=['lawyer', '-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Proposal by {self.lawyer.name} for {self.case.case_title}"
    
    @property
    def is_pending(self):
        """Check if proposal is still pending"""
        return self.status == 'pending'
    
    @property
    def is_accepted(self):
        """Check if proposal was accepted"""
        return self.status == 'accepted'
    
    def accept(self):
        """Mark proposal as accepted"""
        self.status = 'accepted'
        self.reviewed_at = timezone.now()
        self.save()
    
    def reject(self, feedback=None):
        """Mark proposal as rejected"""
        self.status = 'rejected'
        self.reviewed_at = timezone.now()
        if feedback:
            self.client_feedback = feedback
        self.save()
    
    def withdraw(self):
        """Withdraw the proposal"""
        self.status = 'withdrawn'
        self.save()
