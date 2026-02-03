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
    preferred_lawyers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(role='Lawyer'),
        required=False
    )
    
    class Meta:
        model = Case
        fields = [
            'id', 'client', 'client_name', 'client_email', 'lawyer', 'lawyer_name',
            'preferred_lawyers',
            'case_title', 'case_category', 'case_description',
            'urgency_level', 'lawyer_selection', 'request_consultation',
            'status', 'proposal_count', 'rejection_reason', 'notes',
            'case_number', 'court_name', 'opposing_party', 'next_hearing_date',
            'created_at', 'updated_at', 'accepted_at', 'completed_at',
            'documents'
        ]
        read_only_fields = ['id', 'client', 'proposal_count', 'created_at', 'updated_at', 'accepted_at', 'completed_at']
    
    def create(self, validated_data):
        # Set client from request user
        request = self.context.get('request')
        preferred_lawyers = validated_data.pop('preferred_lawyers', [])
        validated_data['client'] = request.user
        
        # Set initial status based on lawyer_selection
        if validated_data.get('lawyer_selection') == 'public':
            validated_data['status'] = 'public'
        else:
            validated_data['status'] = 'sent_to_lawyers'

        instance = super().create(validated_data)
        if preferred_lawyers:
            instance.preferred_lawyers.set(preferred_lawyers)
        return instance


class CaseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing cases"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    client_profile_image = serializers.SerializerMethodField()
    lawyer_name = serializers.CharField(source='lawyer.name', read_only=True, allow_null=True)
    lawyer_email = serializers.CharField(source='lawyer.email', read_only=True, allow_null=True)
    lawyer_phone = serializers.CharField(source='lawyer.phone', read_only=True, allow_null=True)
    lawyer_profile_image = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Case
        fields = [
            'id', 'case_title', 'case_category', 'case_description', 'status', 'urgency_level',
            'lawyer_selection', 'request_consultation',
            'client_name', 'client_email', 'client_profile_image', 
            'lawyer', 'lawyer_name', 'lawyer_email', 'lawyer_phone', 'lawyer_profile_image',
            'proposal_count', 'document_count',
            'case_number', 'court_name', 'opposing_party', 'next_hearing_date',
            'created_at', 'updated_at', 'accepted_at'
        ]
    
    def get_document_count(self, obj):
        return obj.documents.count()
    
    def get_client_profile_image(self, obj):
        if obj.client and obj.client.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.client.profile_image.url)
            return obj.client.profile_image.url
        return None

    def get_lawyer_profile_image(self, obj):
        if obj.lawyer and obj.lawyer.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.lawyer.profile_image.url)
            return obj.lawyer.profile_image.url
        return None


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
