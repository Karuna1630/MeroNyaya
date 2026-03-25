from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from case.models import Case
from .models import Message, Conversation
from .serializers import MessageSerializer, UserMinimalSerializer
from authentication.models import User
from notification.utils import send_notification


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_list(request):
    """
    GET /api/chat/conversations/
    List all conversations grouped by the other user.
    Returns one entry per user (not per case).
    Both lawyer and client use this same endpoint.
    """
    user = request.user

    # Get all conversations where user is client or lawyer, excluding pending cases
    conversations = Conversation.objects.filter(
        Q(case__client=user) | Q(case__lawyer=user)
    ).exclude(case__status='pending').select_related('case', 'case__client', 'case__lawyer')

    # Group by the other user
    grouped = {}
    for conv in conversations:
        other_user = conv.case.lawyer if conv.case.client == user else conv.case.client
        if other_user.id not in grouped:
            grouped[other_user.id] = {
                'other_user': other_user,
                'conversations': [],
            }
        grouped[other_user.id]['conversations'].append(conv)

    # Build response
    result = []
    for user_id, data in grouped.items():
        other_user = data['other_user']
        convs = data['conversations']

        # Get last message across all conversations with this user
        last_message = Message.objects.filter(
            conversation__in=convs
        ).order_by('-timestamp').first()

        # Count unread messages across all conversations with this user
        unread_count = Message.objects.filter(
            conversation__in=convs,
            is_read=False
        ).exclude(sender=user).count()

        result.append({
            'user': UserMinimalSerializer(other_user, context={'request': request}).data,
            'last_message': {
                'content': last_message.content,
                'timestamp': last_message.timestamp,
                'sender_id': last_message.sender.id,
            } if last_message else None,
            'unread_count': unread_count,
            'case_count': len(convs),
            'updated_at': max(c.updated_at for c in convs),
        })

    # Sort by most recent activity
    result.sort(key=lambda x: x['updated_at'], reverse=True)

    return Response(result)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def messages(request, user_id):
    """
    GET  /api/chat/conversations/<user_id>/messages/ — Get all messages
    POST /api/chat/conversations/<user_id>/messages/ — Send a message
    Both lawyer and client use this same endpoint.
    """
    other_user = get_object_or_404(User, id=user_id)

    # Find all non-pending cases between the two users
    cases = Case.objects.filter(
        Q(client=request.user, lawyer=other_user) |
        Q(lawyer=request.user, client=other_user)
    ).exclude(status='pending')

    if not cases.exists():
        return Response(
            {'error': 'No active cases with this user. Chat is only available once a case is accepted.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        return _get_messages(request, other_user, cases)
    else:
        return _send_message(request, other_user, cases)


def _get_messages(request, other_user, cases):
    """Get all messages with a specific user across all shared cases."""
    conversations = Conversation.objects.filter(case__in=cases)

    all_messages = Message.objects.filter(
        conversation__in=conversations
    ).order_by('timestamp')

    serializer = MessageSerializer(all_messages, many=True, context={'request': request})

    return Response({
        'user': UserMinimalSerializer(other_user, context={'request': request}).data,
        'messages': serializer.data,
        'case_ids': list(cases.values_list('id', flat=True)),
    })


def _send_message(request, other_user, cases):
    """Send a message to a specific user."""
    content = request.data.get('content', '').strip()

    if not content:
        return Response(
            {'error': 'Message content cannot be empty'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Use the most recently updated case
    case = cases.order_by('-updated_at').first()

    # Create or get conversation for this case
    conversation, _ = Conversation.objects.get_or_create(case=case)

    # Create message
    message = Message.objects.create(
        conversation=conversation,
        sender=request.user,
        content=content
    )

    # Send notification to the other user
    sender_name = request.user.name or request.user.email
    preview = content[:80] + ("..." if len(content) > 80 else "")
    message_link = (
        "/lawyermessage"
        if other_user.role == "Lawyer"
        else "/clientmessage"
    )
    send_notification(
        user=other_user,
        title=f"New message from {sender_name}",
        message=preview,
        notif_type="message",
        link=message_link,
    )

    # Broadcast via WebSocket to the user-pair group
    channel_layer = get_channel_layer()
    message_data = MessageSerializer(message, context={'request': request}).data

    group_name = f'chat_user_{min(request.user.id, other_user.id)}_{max(request.user.id, other_user.id)}'
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'chat_message',
            'message': message_data
        }
    )

    return Response(message_data, status=status.HTTP_201_CREATED)
