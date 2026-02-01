from rest_framework import serializers
from .models import Review
from authentication.models import User


class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    lawyer_name = serializers.CharField(source='lawyer.name', read_only=True)
    client_profile_image = serializers.ImageField(source='client.profile_image', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id',
            'client',
            'client_name',
            'client_profile_image',
            'lawyer',
            'lawyer_name',
            'title',
            'comment',
            'rating',
            'created_at',
            'updated_at',
            'is_verified_consultation',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Ensure unique review per client-lawyer pair per day
        client = validated_data.get('client')
        lawyer = validated_data.get('lawyer')
        
        review, created = Review.objects.get_or_create(
            client=client,
            lawyer=lawyer,
            defaults=validated_data
        )
        
        if not created:
            # Update existing review if already exists
            for attr, value in validated_data.items():
                setattr(review, attr, value)
            review.save()
        
        return review


class LawyerReviewSummarySerializer(serializers.Serializer):
    """Serializer for lawyer review summary statistics"""
    lawyer_id = serializers.IntegerField()
    lawyer_name = serializers.CharField()
    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    rating_distribution = serializers.DictField()  # {1: count, 2: count, etc}
    recent_reviews = ReviewSerializer(many=True)
