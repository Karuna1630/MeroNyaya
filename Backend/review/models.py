from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from authentication.models import User
from kyc.models import LawyerKYC


class Review(models.Model):
    """
    Model for storing client reviews and ratings for lawyers
    """
    # Relationships
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given', limit_choices_to={'role': 'Client'})
    lawyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received', limit_choices_to={'role': 'Lawyer'})
    
    # Review Content
    title = models.CharField(max_length=255, blank=True, null=True)
    comment = models.TextField(help_text="Client's detailed review comment")
    rating = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified_consultation = models.BooleanField(
        default=False,
        help_text="Whether this review is from a verified consultation"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Review')
        verbose_name_plural = _('Reviews')
        unique_together = ['client', 'lawyer', 'created_at']
    
    def __str__(self):
        return f"Review by {self.client.name} for {self.lawyer.name} - {self.rating} stars"
    
    @property
    def average_rating(self):
        """Get average rating for this lawyer"""
        from django.db.models import Avg
        avg = Review.objects.filter(lawyer=self.lawyer).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 2) if avg else 0
    
    @property
    def review_count(self):
        """Get total review count for this lawyer"""
        return Review.objects.filter(lawyer=self.lawyer).count()
