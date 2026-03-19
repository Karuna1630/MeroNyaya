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
    """Serializer for individual messages"""
    sender_details = UserMinimalSerializer(source='sender', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_details', 'content', 'timestamp', 'is_read']
        read_only_fields = ['id', 'timestamp', 'sender', 'sender_details']


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Detailed conversation serializer with messages and other user info"""
    case_id = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)
    other_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'case_id', 'messages', 'other_user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_case_id(self, obj):
        """Return the associated case ID"""
        return obj.case.id
    
    def get_other_user(self, obj):
        """Return the other user in the conversation"""
        request = self.context.get('request')
        if request and request.user:
            # If current user is client, return lawyer
            if obj.case.client == request.user:
                return UserMinimalSerializer(obj.case.lawyer, context=self.context).data
            # If current user is lawyer, return client
            else:
                return UserMinimalSerializer(obj.case.client, context=self.context).data
        return None


class ConversationListSerializer(serializers.ModelSerializer):
    """Simplified conversation serializer for listing"""
    case_id = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'case_id', 'other_user', 'last_message', 'updated_at']
        read_only_fields = ['id', 'updated_at']
    
    def get_case_id(self, obj):
        """Return the associated case ID"""
        return obj.case.id
    
    def get_other_user(self, obj):
        """Return the other user in the conversation"""
        request = self.context.get('request')
        if request and request.user:
            if obj.case.client == request.user:
                return UserMinimalSerializer(obj.case.lawyer, context=self.context).data
            else:
                return UserMinimalSerializer(obj.case.client, context=self.context).data
        return None
    
    def get_last_message(self, obj):
        """Get the last message content and timestamp"""
        last_message = obj.messages.last()
        if last_message:
            return {
                'content': last_message.content,
                'timestamp': last_message.timestamp,
                'sender_id': last_message.sender.id
            }
        return None
