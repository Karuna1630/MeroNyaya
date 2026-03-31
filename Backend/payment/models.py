import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta
from authentication.models import User
from appointment.models import Appointment
from case.models import Case


class Payment(models.Model):
    STATUS_INITIATED = "initiated"
    STATUS_COMPLETED = "completed"
    STATUS_FAILED = "failed"
    STATUS_REFUNDED = "refunded"

    STATUS_CHOICES = [
        (STATUS_INITIATED, "Initiated"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_FAILED, "Failed"),
        (STATUS_REFUNDED, "Refunded"),
    ]

    PAYOUT_PENDING = "pending"
    PAYOUT_PAID = "paid"

    PAYOUT_CHOICES = [
        (PAYOUT_PENDING, "Pending"),
        (PAYOUT_PAID, "Paid"),
    ]

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name="payments",
        null=True,
        blank=True,
    )
    case_payment_request = models.ForeignKey(
        "CasePaymentRequest",
        on_delete=models.CASCADE,
        related_name="payments",
        null=True,
        blank=True,
    )
    # Client who made the payment
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    # Lawyer who receives the earning
    lawyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="lawyer_payments",
        null=True,
        blank=True,
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Commission split — platform takes a percentage, lawyer gets the rest
    platform_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Platform commission deducted from the total.",
    )
    lawyer_earning = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Amount the lawyer receives after platform fee.",
    )

    # Payout tracking — whether the lawyer has been paid their share
    payout_status = models.CharField(
        max_length=20,
        choices=PAYOUT_CHOICES,
        default=PAYOUT_PENDING,
        help_text="Whether the lawyer has been paid their earning.",
    )

    transaction_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_INITIATED,
    )
    esewa_ref_id = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=50, default="esewa")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment #{self.id} | {self.transaction_uuid} | {self.status}"


class Payout(models.Model):
    """
    Tracks individual payouts from admin to lawyer.
    Each payout can cover one or more completed payments.
    """
    lawyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="payouts",
    )
    # Admin who processed this payout
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_payouts",
    )
    # Payments included in this payout
    payments = models.ManyToManyField(
        Payment,
        related_name="payouts",
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        help_text="Total amount paid out to the lawyer.",
    )
    reference_number = models.CharField(
        max_length=255, blank=True, null=True,
        help_text="Bank transfer or eSewa reference number.",
    )
    payment_method = models.CharField(
        max_length=100, blank=True, null=True,
        help_text="Method used for payout (e.g., bank transfer, eSewa).",
    )
    notes = models.TextField(
        blank=True, null=True,
        help_text="Optional notes about this payout.",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payout #{self.id} | {self.lawyer.name} | Rs. {self.amount}"


class CasePaymentRequest(models.Model):
    """
    Model for handling payment requests when a case is completed.
    Lawyers can request payment from clients with negotiation capability.
    """
    
    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),  # Initial request from lawyer
        ("negotiating", "Negotiating"),  # Client made counter-offer
        ("agreed", "Agreed"),  # Both parties agreed on amount
        ("paid", "Paid"),  # Payment completed
        ("cancelled", "Cancelled"),  # Request cancelled
        ("disputed", "Disputed"),  # Escalated to admin after max rejections
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.OneToOneField(
        Case,
        on_delete=models.CASCADE,
        related_name="payment_request",
        help_text="The case for which payment is being requested.",
    )
    lawyer = models.ForeignKey(
        "authentication.User",
        on_delete=models.CASCADE,
        related_name="case_payment_requests",
        help_text="The lawyer requesting payment.",
    )
    
    # Amount tracking
    proposed_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Initial amount proposed by lawyer.",
    )
    current_agreed_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Currently agreed amount (may be different from proposed).",
    )
    client_counter_offer = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Latest counter-offer from client.",
    )
    
    # Status and negotiation tracking
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="pending",
        help_text="Current status of payment request.",
    )
    rejection_count = models.IntegerField(
        default=0,
        help_text="Number of times client rejected the offer.",
    )
    
    # Timeline
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Payment request expires 30 days after creation.",
    )
    responded_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When client first responded to payment request.",
    )
    agreed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When both parties agreed on amount.",
    )
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When payment was completed.",
    )
    
    # Additional fields
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Lawyer's justification for the amount.",
    )
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["lawyer", "status"]),
            models.Index(fields=["expires_at"]),
        ]
    
    def __str__(self):
        return f"Payment Request: {self.case.case_title} | Rs. {self.proposed_amount} | {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        # Set expires_at on creation (30 days from creation)
        if not self.id:
            self.expires_at = timezone.now() + timedelta(days=30)
        super().save(*args, **kwargs)
