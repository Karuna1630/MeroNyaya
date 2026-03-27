from rest_framework import serializers
from .models import Message, Conversation
from authentication.models import User


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user serializer for chat context"""
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'profile_image']
        read_only_fields = ['id', 'name', 'email', 'role', 'profile_image']

    def get_profile_image(self, obj):
        """Get full URL for profile image"""
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for individual messages (text and voice)"""
    sender_details = UserMinimalSerializer(source='sender', read_only=True)
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_details', 'message_type', 'content', 'audio', 'audio_url', 'timestamp', 'is_read']
        read_only_fields = ['id', 'timestamp', 'sender', 'sender_details', 'message_type', 'audio_url']

    def get_audio_url(self, obj):
        """Get full URL for audio file"""
        if obj.audio:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.audio.url)
            return obj.audio.url
        return None
