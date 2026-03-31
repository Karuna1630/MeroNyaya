from rest_framework import serializers
from .models import Payment, Payout, CasePaymentRequest
from case.models import Case


class PaymentSerializer(serializers.ModelSerializer):
    appointment_id = serializers.IntegerField(source="appointment.id", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_profile_image = serializers.ImageField(source="user.profile_image", read_only=True, default=None)
    lawyer_name = serializers.CharField(source="lawyer.name", read_only=True, default=None)
    lawyer_email = serializers.CharField(source="lawyer.email", read_only=True, default=None)

    class Meta:
        model = Payment
        fields = [
            "id",
            "appointment",
            "appointment_id",
            "user",
            "user_name",
            "user_profile_image",
            "lawyer",
            "lawyer_name",
            "lawyer_email",
            "amount",
            "tax_amount",
            "total_amount",
            "platform_fee",
            "lawyer_earning",
            "payout_status",
            "transaction_uuid",
            "status",
            "esewa_ref_id",
            "payment_method",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "transaction_uuid",
            "status",
            "esewa_ref_id",
            "platform_fee",
            "lawyer_earning",
            "payout_status",
            "created_at",
            "updated_at",
        ]


class EsewaInitiateSerializer(serializers.Serializer):
    """Serializer for the eSewa payment initiation request."""
    appointment_id = serializers.IntegerField()


class KhaltiInitiateSerializer(serializers.Serializer):
    """Serializer for the Khalti payment initiation request."""
    appointment_id = serializers.IntegerField()


class PayoutSerializer(serializers.ModelSerializer):
    """Serializer for the Payout model."""
    lawyer_name = serializers.CharField(source="lawyer.name", read_only=True)
    lawyer_email = serializers.CharField(source="lawyer.email", read_only=True)
    processed_by_name = serializers.CharField(source="processed_by.name", read_only=True, default=None)
    payment_ids = serializers.SerializerMethodField()

    class Meta:
        model = Payout
        fields = [
            "id",
            "lawyer",
            "lawyer_name",
            "lawyer_email",
            "processed_by",
            "processed_by_name",
            "amount",
            "reference_number",
            "payment_method",
            "notes",
            "payment_ids",
            "created_at",
        ]
        read_only_fields = ["id", "processed_by", "processed_by_name", "created_at"]

    def get_payment_ids(self, obj):
        return list(obj.payments.values_list("id", flat=True))


class CreatePayoutSerializer(serializers.Serializer):
    """Serializer for creating a payout to a lawyer."""
    lawyer_id = serializers.IntegerField(help_text="The lawyer user ID to pay out.")
    payment_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of completed payment IDs to include in this payout.",
    )
    reference_number = serializers.CharField(
        max_length=255, required=False, allow_blank=True,
        help_text="Bank or eSewa transfer reference number.",
    )
    payment_method = serializers.CharField(
        max_length=100, required=False, allow_blank=True,
        help_text="Method used (bank_transfer, esewa, etc.).",
    )
    notes = serializers.CharField(
        required=False, allow_blank=True,
        help_text="Optional notes about this payout.",
    )


class CasePaymentRequestSerializer(serializers.ModelSerializer):
    """Serializer for case payment requests with negotiation tracking."""
    
    # Nested case information
    case_id = serializers.IntegerField(source="case.id", read_only=True)
    case_title = serializers.CharField(source="case.case_title", read_only=True)
    case_description = serializers.CharField(source="case.case_description", read_only=True, allow_null=True)
    
    # Lawyer information
    lawyer_id = serializers.IntegerField(source="lawyer.id", read_only=True)
    lawyer_name = serializers.CharField(source="lawyer.name", read_only=True)
    lawyer_email = serializers.CharField(source="lawyer.email", read_only=True)
    lawyer_profile_image = serializers.ImageField(source="lawyer.profile_image", read_only=True, allow_null=True)
    
    # Client information (from case)
    client_id = serializers.IntegerField(source="case.client.id", read_only=True)
    client_name = serializers.CharField(source="case.client.name", read_only=True)
    client_email = serializers.CharField(source="case.client.email", read_only=True)
    client_profile_image = serializers.ImageField(source="case.client.profile_image", read_only=True, allow_null=True)
    
    class Meta:
        model = CasePaymentRequest
        fields = [
            "id",
            "case",
            "case_id",
            "case_title",
            "case_description",
            "lawyer",
            "lawyer_id",
            "lawyer_name",
            "lawyer_email",
            "lawyer_profile_image",
            "client_id",
            "client_name",
            "client_email",
            "client_profile_image",
            "proposed_amount",
            "current_agreed_amount",
            "client_counter_offer",
            "status",
            "rejection_count",
            "description",
            "created_at",
            "expires_at",
            "responded_at",
            "agreed_at",
            "paid_at",
        ]
        read_only_fields = [
            "id",
            "case_id",
            "case_title",
            "case_description",
            "lawyer_id",
            "lawyer_name",
            "lawyer_email",
            "lawyer_profile_image",
            "client_id",
            "client_name",
            "client_email",
            "client_profile_image",
            "status",
            "rejection_count",
            "created_at",
            "expires_at",
            "responded_at",
            "agreed_at",
            "paid_at",
        ]


class CreateCasePaymentRequestSerializer(serializers.Serializer):
    """Serializer for lawyer to create a payment request for a case."""
    
    case_id = serializers.IntegerField(help_text="The case ID for which payment is being requested.")
    proposed_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Initial amount proposed by lawyer.",
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Justification for the amount.",
    )


class RespondToCasePaymentSerializer(serializers.Serializer):
    """Serializer for client to respond to a payment request."""
    
    RESPONSE_CHOICES = [
        ("accept", "Accept"),
        ("reject", "Reject"),
        ("counter", "Counter-offer"),
    ]
    
    response = serializers.ChoiceField(
        choices=RESPONSE_CHOICES,
        help_text="Client's response to payment request.",
    )
    counter_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True,
        help_text="Amount offered in counter-proposal (required if response='counter').",
    )
    
    def validate(self, data):
        if data.get("response") == "counter" and not data.get("counter_amount"):
            raise serializers.ValidationError(
                "counter_amount is required when response is 'counter'."
            )
        return data
