from rest_framework import serializers
from .models import Payment, Payout


class PaymentSerializer(serializers.ModelSerializer):
    appointment_id = serializers.IntegerField(source="appointment.id", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)
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
