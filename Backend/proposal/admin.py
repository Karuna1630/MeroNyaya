from django.contrib import admin
from .models import Proposal


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ['lawyer', 'case', 'status', 'created_at', 'reviewed_at']
    list_filter = ['status', 'created_at', 'reviewed_at']
    search_fields = ['proposal_text', 'lawyer__name', 'case__case_title', 'client_feedback']
    readonly_fields = ['created_at', 'updated_at', 'reviewed_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Proposal Information', {
            'fields': ('case', 'lawyer', 'proposal_text')
        }),
        ('Status', {
            'fields': ('status', 'client_feedback')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'reviewed_at'),
            'classes': ('collapse',)
        }),
    )
