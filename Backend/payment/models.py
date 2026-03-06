import uuid
from django.db import models
from authentication.models import User
from appointment.models import Appointment


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
