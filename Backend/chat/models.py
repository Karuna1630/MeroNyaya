from django.db import models
from django.utils import timezone
from authentication.models import User
from case.models import Case


class Conversation(models.Model):
    """
    One conversation per accepted case between client and lawyer.
    Automatically created when a case is accepted.
    """
    case = models.OneToOneField(
        Case, 
        on_delete=models.CASCADE, 
        related_name='conversation',
        help_text="The case associated with this conversation"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Conversation for Case #{self.case.id}"


class Message(models.Model):
    """
    Individual messages in a conversation.
    Linked to a conversation and sender user.
    Supports text and voice messages.
    """
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text Message'),
        ('voice', 'Voice Message'),
    ]
    
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages',
        help_text="The conversation this message belongs to"
    )
    sender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        help_text="User who sent the message"
    )
    message_type = models.CharField(
        max_length=10,
        choices=MESSAGE_TYPE_CHOICES,
        default='text',
        help_text="Type of message: text or voice"
    )
    content = models.TextField(
        help_text="Message content",
        blank=True,
        null=True
    )
    audio = models.FileField(
        upload_to='chat_audio/%Y/%m/%d/',
        blank=True,
        null=True,
        help_text="Audio file for voice messages"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Whether the message has been read by the recipient"
    )
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message by {self.sender} in Case #{self.conversation.case.id}"
