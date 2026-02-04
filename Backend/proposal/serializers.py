from rest_framework import serializers
from .models import Proposal
from case.models import Case
from authentication.models import User


class ProposalSerializer(serializers.ModelSerializer):
    """Serializer for creating and managing proposals"""
    lawyer_name = serializers.CharField(source='lawyer.name', read_only=True)
    lawyer_email = serializers.CharField(source='lawyer.email', read_only=True)
    lawyer_phone = serializers.CharField(source='lawyer.phone', read_only=True)
    lawyer_profile_image = serializers.SerializerMethodField()
    case_title = serializers.CharField(source='case.case_title', read_only=True)
    case_category = serializers.CharField(source='case.case_category', read_only=True)
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'case', 'case_title', 'case_category',
            'lawyer', 'lawyer_name', 'lawyer_email', 'lawyer_phone', 'lawyer_profile_image',
            'proposal_text', 'status', 'client_feedback',
            'created_at', 'updated_at', 'reviewed_at'
        ]
        read_only_fields = ['id', 'lawyer', 'status', 'created_at', 'updated_at', 'reviewed_at']
    
    def get_lawyer_profile_image(self, obj):
        if obj.lawyer and obj.lawyer.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.lawyer.profile_image.url)
        return None
    
    def create(self, validated_data):
        # Set lawyer from request user
        request = self.context.get('request')
        validated_data['lawyer'] = request.user
        return super().create(validated_data)


class ProposalListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing proposals"""
    lawyer_name = serializers.CharField(source='lawyer.name', read_only=True)
    lawyer_email = serializers.CharField(source='lawyer.email', read_only=True)
    lawyer_profile_image = serializers.SerializerMethodField()
    case_title = serializers.CharField(source='case.case_title', read_only=True)
    case_category = serializers.CharField(source='case.case_category', read_only=True)
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'case', 'case_title', 'case_category',
            'lawyer', 'lawyer_name', 'lawyer_email', 'lawyer_profile_image',
            'proposal_text', 'status', 'created_at'
        ]
    
    def get_lawyer_profile_image(self, obj):
        if obj.lawyer and obj.lawyer.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.lawyer.profile_image.url)
        return None
