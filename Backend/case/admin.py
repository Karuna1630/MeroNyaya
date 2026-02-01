from django.contrib import admin
from .models import Case, CaseDocument


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ['case_title', 'client', 'lawyer', 'case_category', 'status', 'urgency_level', 'created_at']
    list_filter = ['status', 'case_category', 'urgency_level', 'created_at']
    search_fields = ['case_title', 'case_description', 'client__name', 'lawyer__name']
    readonly_fields = ['created_at', 'updated_at', 'accepted_at', 'completed_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Case Information', {
            'fields': ('case_title', 'case_category', 'case_description')
        }),
        ('Case Settings', {
            'fields': ('urgency_level', 'lawyer_selection', 'request_consultation')
        }),
        ('Relationships', {
            'fields': ('client', 'lawyer')
        }),
        ('Status', {
            'fields': ('status', 'proposal_count', 'rejection_reason', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'accepted_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CaseDocument)
class CaseDocumentAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'case', 'file_type', 'file_size', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['file_name', 'case__case_title']
    readonly_fields = ['uploaded_at']
    date_hierarchy = 'uploaded_at'
