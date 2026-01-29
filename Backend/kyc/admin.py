from django.contrib import admin
from .models import LawyerKYC


@admin.register(LawyerKYC)
class LawyerKYCAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'status', 'bar_council_number', 'created_at', 'verified_at', 'get_rejection_preview']
    list_filter = ['status', 'created_at', 'gender']
    search_fields = ['full_name', 'email', 'bar_council_number', 'user__email', 'rejection_reason']
    readonly_fields = ['created_at', 'updated_at', 'verified_at', 'rejection_reason']
    
    fieldsets = (
        ('KYC Status & Review', {
            'fields': ('user', 'status', 'rejection_reason', 'verified_at')
        }),
        ('Personal Information', {
            'fields': ('full_name', 'email', 'phone', 'dob', 'gender', 'permanent_address', 'current_address')
        }),
        ('Professional Information', {
            'fields': ('bar_council_number', 'law_firm_name', 'years_of_experience', 'consultation_fee', 
                      'specializations', 'availability_days', 'available_from', 'available_until')
        }),
        ('Identity Documents', {
            'fields': ('citizenship_front', 'citizenship_back', 'lawyer_license', 'passport_photo', 
                      'law_degree', 'experience_certificate')
        }),
        ('Declaration', {
            'fields': ('confirm_accuracy', 'authorize_verification', 'agree_terms')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        """Prevent adding KYC from admin panel"""
        return False

    def get_rejection_preview(self, obj):
        """Display rejection reason preview in list view"""
        if obj.status == 'rejected' and obj.rejection_reason:
            return obj.rejection_reason[:50] + '...' if len(obj.rejection_reason) > 50 else obj.rejection_reason
        return '-'
    get_rejection_preview.short_description = 'Rejection Review'
