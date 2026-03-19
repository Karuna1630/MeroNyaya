from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

from case.models import Case
from .models import Message, Conversation
from .serializers import (
    MessageSerializer, 
    ConversationDetailSerializer,
    ConversationListSerializer
)


class ConversationViewSet(viewsets.ViewSet):
    """
    ViewSet for managing conversations and messages.
    Only available for accepted cases where user is client or lawyer.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_conversations(self, request):
        """
        Get all conversations for the current user.
        User can be either client or lawyer in the conversations.
        """
        user = request.user
        
        # Get conversations where user is either client or lawyer
        conversations = Conversation.objects.filter(
            Q(case__client=user) | Q(case__lawyer=user)
        )
        
        serializer = ConversationListSerializer(
            conversations, 
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def case_conversation(self, request):
        """
        Get conversation for a specific case.
        Returns conversation with all messages.
        """
        case_id = request.query_params.get('case_id')
        
        if not case_id:
            return Response(
                {'error': 'case_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        case = get_object_or_404(Case, id=case_id)
        
        # Verify user is client or lawyer on this case
        if request.user != case.client and request.user != case.lawyer:
            return Response(
                {'error': 'You are not part of this case'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check case status is 'accepted'
        if case.status != 'accepted':
            return Response(
                {'error': 'Chat only available for accepted cases'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create conversation if it doesn't exist
        conversation, created = Conversation.objects.get_or_create(case=case)
        serializer = ConversationDetailSerializer(
            conversation, 
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """
        Send a message to a case conversation.
        Message is saved to a database and broadcasted via WebSocket.
        """
        case_id = request.data.get('case_id')
        content = request.data.get('content', '').strip()
        
        # Validation
        if not case_id:
            return Response(
                {'error': 'case_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not content:
            return Response(
                {'error': 'Message content cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get case
        case = get_object_or_404(Case, id=case_id)
        
        # Authorization check
        if request.user != case.client and request.user != case.lawyer:
            return Response(
                {'error': 'Not authorized to send message in this case'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Case status check
        if case.status != 'accepted':
            return Response(
                {'error': 'Chat only available for accepted cases'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create or get conversation
        conversation, _ = Conversation.objects.get_or_create(case=case)
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        
        # Broadcast message via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'chat_{case_id}',
            {
                'type': 'chat_message',
                'message': MessageSerializer(message, context={'request': request}).data
            }
        )
        
        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def mark_message_read(self, request):
        """
        Mark a specific message as read.
        """
        message_id = request.data.get('message_id')
        
        if not message_id:
            return Response(
                {'error': 'message_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message = get_object_or_404(Message, id=message_id)
        
        # Only recipient can mark messages as read
        case = message.conversation.case
        if request.user == message.sender:
            return Response(
                {'error': 'Cannot mark your own message as read'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user != case.client and request.user != case.lawyer:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.is_read = True
        message.save()
        
        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Get count of unread messages across all conversations.
        """
        user = request.user
        
        # Get all conversations for user
        conversations = Conversation.objects.filter(
            Q(case__client=user) | Q(case__lawyer=user)
        )
        
        # Count unread messages (where sender is not current user)
        unread_count = Message.objects.filter(
            conversation__in=conversations,
            is_read=False
        ).exclude(sender=user).count()
        
        return Response({
            'unread_count': unread_count
        })
