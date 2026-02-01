from rest_framework import serializers
from .models import Case, CaseDocument
from authentication.models import User


class CaseDocumentSerializer(serializers.ModelSerializer):
    """Serializer for case documents"""
    
    class Meta:
        model = CaseDocument
        fields = ['id', 'file', 'file_name', 'file_type', 'file_size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class CaseSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating cases"""
    documents = CaseDocumentSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    lawyer_name = serializers.CharField(source='lawyer.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Case
        fields = [
            'id', 'client', 'client_name', 'client_email', 'lawyer', 'lawyer_name',
            'case_title', 'case_category', 'case_description',
            'urgency_level', 'lawyer_selection', 'request_consultation',
            'status', 'proposal_count', 'rejection_reason', 'notes',
            'created_at', 'updated_at', 'accepted_at', 'completed_at',
            'documents'
        ]
        read_only_fields = ['id', 'client', 'proposal_count', 'created_at', 'updated_at', 'accepted_at', 'completed_at']
    
    def create(self, validated_data):
        # Set client from request user
        request = self.context.get('request')
        validated_data['client'] = request.user
        
        # Set initial status based on lawyer_selection
        if validated_data.get('lawyer_selection') == 'public':
            validated_data['status'] = 'public'
        else:
            validated_data['status'] = 'sent_to_lawyers'
        
        return super().create(validated_data)


class CaseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing cases"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    lawyer_name = serializers.CharField(source='lawyer.name', read_only=True, allow_null=True)
    document_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Case
        fields = [
            'id', 'case_title', 'case_category', 'status', 'urgency_level',
            'client_name', 'lawyer_name', 'proposal_count', 'document_count',
            'created_at', 'updated_at'
        ]
    
    def get_document_count(self, obj):
        return obj.documents.count()


class PublicCaseSerializer(serializers.ModelSerializer):
    """Serializer for public cases visible to lawyers"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    document_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Case
        fields = [
            'id', 'case_title', 'case_category', 'case_description',
            'urgency_level', 'request_consultation',
            'client_name', 'proposal_count', 'document_count',
            'created_at'
        ]
    
    def get_document_count(self, obj):
        return obj.documents.count()
