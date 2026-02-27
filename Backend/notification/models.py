from django.db import models
from django.utils.translation import gettext_lazy as _
from authentication.models import User


class Notification(models.Model):
    """
    Model for storing user notifications
    """

    # Notification Type Choices
    TYPE_CHOICES = [
        ('case',        'Case Update'),
        ('appointment', 'Appointment'),
        ('message',     'Message'),
        ('payment',     'Payment'),
        ('alert',       'Alert'),
        ('system',      'System'),
    ]

    # Relationships
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="User this notification belongs to"
    )

    # Content
    title = models.CharField(
        max_length=255,
        help_text="Short title of the notification"
    )
    message = models.TextField(
        help_text="Full notification message"
    )
    notif_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='system',
        help_text="Category of the notification"
    )

    # Status
    is_read = models.BooleanField(
        default=False,
        help_text="Whether the user has read this notification"
    )

    # Navigation link (frontend route to navigate to when clicked)
    link = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Frontend route to navigate to when notification is clicked"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f"[{self.notif_type}] {self.title} → {self.user}"

    @property
    def is_unread(self):
        """Check if notification has not been read yet"""
        return not self.is_read

    def mark_as_read(self):
        """Mark this notification as read"""
        self.is_read = True
        self.save()
