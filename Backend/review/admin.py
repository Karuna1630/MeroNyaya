from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('client', 'lawyer', 'rating', 'created_at', 'is_verified_consultation')
    list_filter = ('rating', 'created_at', 'is_verified_consultation')
    search_fields = ('client__name', 'lawyer__name', 'comment')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Review Information', {
            'fields': ('client', 'lawyer', 'title', 'comment', 'rating')
        }),
        ('Verification', {
            'fields': ('is_verified_consultation',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
