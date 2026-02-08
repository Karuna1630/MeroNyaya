from rest_framework import serializers
from .models import Case, CaseDocument, CaseTimeline, CaseAppointment
from authentication.models import User


class CaseDocumentSerializer(serializers.ModelSerializer):
    """Serializer for case documents"""

    uploaded_by_name = serializers.SerializerMethodField()
    uploaded_by_role = serializers.SerializerMethodField()

    class Meta:
        model = CaseDocument
        fields = [
            'id', 'file', 'file_name', 'file_type', 'file_size',
            'uploaded_at', 'uploaded_by', 'uploaded_by_name', 'uploaded_by_role'
        ]
        read_only_fields = ['id', 'uploaded_at']

    # FILE VALIDATION (size + type)
    def validate_file(self, value):
        # max 5MB
        max_size = 5 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError("File must be under 5MB")

        allowed_extensions = ['pdf', 'jpg', 'png', 'docx']
        ext = value.name.split('.')[-1].lower()

        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                "Allowed file types: pdf, jpg, png, docx"
            )

        return value

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.name
        return None

    def get_uploaded_by_role(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.role
        return None

class CaseTimelineSerializer(serializers.ModelSerializer):
    """Serializer for case timeline events"""
    created_by_name = serializers.SerializerMethodField()
    created_by_role = serializers.SerializerMethodField()
    
    class Meta:
        model = CaseTimeline
        fields = ['id', 'event_type', 'title', 'description', 'created_by', 'created_by_name', 'created_by_role', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.name
        return 'System'
    
    def get_created_by_role(self, obj):
        if obj.created_by:
            return obj.created_by.role
        return 'System'


class CaseAppointmentSerializer(serializers.ModelSerializer):
    """Serializer for case appointments"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_profile_image = serializers.SerializerMethodField()
    lawyer_name = serializers.CharField(source='lawyer.name', read_only=True, allow_null=True)
    lawyer_profile_image = serializers.SerializerMethodField()
    case_title = serializers.CharField(source='case.case_title', read_only=True)
    case_category = serializers.CharField(source='case.case_category', read_only=True)

    class Meta:
        model = CaseAppointment
        fields = [
            'id', 'case', 'case_title', 'case_category', 'client', 'client_name', 'client_profile_image', 
            'lawyer', 'lawyer_name', 'lawyer_profile_image',
            'title', 'mode', 'preferred_day', 'preferred_time',
            'meeting_location', 'phone_number', 'scheduled_date', 'scheduled_time', 'meeting_link', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'case', 'client', 'lawyer', 'status', 'created_at', 'updated_at']

    def validate(self, attrs):
        mode = attrs.get('mode', CaseAppointment.MODE_VIDEO)
        if mode == CaseAppointment.MODE_IN_PERSON:
            if not attrs.get('meeting_location'):
                raise serializers.ValidationError({'meeting_location': 'Meeting location is required for in-person appointments.'})
            if not attrs.get('phone_number'):
                raise serializers.ValidationError({'phone_number': 'Phone number is required for in-person appointments.'})
        return attrs

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


class CaseSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating cases"""
    documents = CaseDocumentSerializer(many=True, read_only=True)
    timeline = CaseTimelineSerializer(many=True, read_only=True)
    appointments = CaseAppointmentSerializer(many=True, read_only=True)
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
            'documents', 'timeline', 'appointments'
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
    documents = CaseDocumentSerializer(many=True, read_only=True)
    timeline = CaseTimelineSerializer(many=True, read_only=True)
    appointments = CaseAppointmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Case
        fields = [
            'id', 'case_title', 'case_category', 'case_description', 'status', 'urgency_level',
            'lawyer_selection', 'request_consultation',
            'client_name', 'client_email', 'client_profile_image', 
            'lawyer', 'lawyer_name', 'lawyer_email', 'lawyer_phone', 'lawyer_profile_image',
            'proposal_count', 'document_count', 'documents', 'timeline',
            'case_number', 'court_name', 'opposing_party', 'next_hearing_date',
            'created_at', 'updated_at', 'accepted_at', 'appointments'
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
