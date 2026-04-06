from rest_framework import serializers
from .models import Review
from authentication.models import User


class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    lawyer_name = serializers.CharField(source='lawyer.name', read_only=True)
    client_profile_image = serializers.SerializerMethodField()
    lawyer_id = serializers.IntegerField(write_only=True)
    appointment_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    case_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    is_verified_consultation = serializers.SerializerMethodField()
    
    def get_is_verified_consultation(self, obj):
        """Auto-calculated: true if linked to appointment or case"""
        return bool(obj.appointment or obj.case)
    
    def get_client_profile_image(self, obj):
        if obj.client and obj.client.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.client.profile_image.url)
            return obj.client.profile_image.url
        return None
        
    
    class Meta:
        model = Review
        fields = [
            'id',
            'client',
            'client_name',
            'client_profile_image',
            'lawyer',
            'lawyer_id',
            'lawyer_name',
            'appointment_id',
            'case_id',
            'comment',
            'rating',
            'is_verified_consultation',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'client', 'lawyer', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Remove write_only fields
        validated_data.pop('lawyer_id', None)
        validated_data.pop('appointment_id', None)
        validated_data.pop('case_id', None)
        return Review.objects.create(**validated_data)


class LawyerReviewSummarySerializer(serializers.Serializer):
    """Serializer for lawyer review summary statistics - returns dynamic review data"""
    lawyer_id = serializers.IntegerField()
    lawyer_name = serializers.CharField()
    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    rating_distribution = serializers.DictField()  # {1: count, 2: count, etc}
    recent_reviews = ReviewSerializer(many=True)
    has_reviews = serializers.BooleanField()  # True if there are reviews, False otherwise
    message = serializers.CharField(required=False)  # Message when no reviews exist
