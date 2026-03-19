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
    """
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
    content = models.TextField(
        help_text="Message content"
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
