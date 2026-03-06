from django.contrib import admin
from .models import Payment, Payout


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        "id", "user", "lawyer", "appointment", "total_amount",
        "platform_fee", "lawyer_earning", "payout_status", "status", "payment_method",
        "transaction_uuid", "created_at",
    ]
    list_filter = ["status", "payout_status", "payment_method", "created_at"]
    search_fields = ["transaction_uuid", "esewa_ref_id", "user__name", "user__email", "lawyer__name", "lawyer__email"]
    readonly_fields = ["transaction_uuid", "platform_fee", "lawyer_earning", "created_at", "updated_at"]


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ["id", "lawyer", "amount", "reference_number", "payment_method", "processed_by", "created_at"]
    list_filter = ["payment_method", "created_at"]
    search_fields = ["lawyer__name", "lawyer__email", "reference_number"]
    readonly_fields = ["created_at"]
