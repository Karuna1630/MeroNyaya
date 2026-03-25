import json
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.conf import settings
from django.db.models import Q
from case.models import Case
from .models import Message, Conversation
from .serializers import MessageSerializer
from .presence import mark_user_online, mark_user_offline, broadcast_presence_update
from notification.utils import send_notification


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for user-pair chat.
    Group name: chat_user_<min_id>_<max_id>

    Features:
    - Authenticate user via JWT token from query params
    - Verify users share at least one accepted case
    - Send conversation history on connection
    - Broadcast new messages in real-time
    """

    async def connect(self):
        """Handle WebSocket connection"""
        self.user = await self.get_user_from_token()
        self.other_user_id = self.scope['url_route']['kwargs']['user_id']

        if self.user is None:
            await self.close()
            return

        # Validate that users share at least one accepted case
        self.other_user = await self.get_other_user_and_validate()

        if self.other_user is None:
            await self.close()
            return

        # Create deterministic group name for this user pair
        self.group_name = f'chat_user_{min(self.user.id, self.other_user.id)}_{max(self.user.id, self.other_user.id)}'

        # Join WebSocket group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Accept the connection
        await self.accept()

        # Mark user as online
        await self._mark_user_online()

        # Send conversation history
        messages = await self.get_conversation_history()
        await self.send(text_data=json.dumps({
            'type': 'initial_messages',
            'messages': messages
        }))

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'group_name'):
            if hasattr(self, 'user') and self.user:
                await self._mark_user_offline()

            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle incoming messages from WebSocket client"""
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message_content = data.get('message', '').strip()

        if not message_content:
            await self.send(text_data=json.dumps({
                'error': 'Message content cannot be empty'
            }))
            return

        # Save message to database
        message_obj = await self.save_message(message_content)

        if message_obj is None:
            await self.send(text_data=json.dumps({
                'error': 'Failed to save message'
            }))
            return

        # Broadcast to group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message_obj
            }
        )

    async def chat_message(self, event):
        """Handle message broadcast from group."""
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))

    async def presence_update(self, event):
        """Handle presence update broadcast from group."""
        await self.send(text_data=json.dumps({
            'type': 'presence_update',
            'online_users': event['online_users']
        }))

    # ── Database helper methods ──────────────────────────────────────────────────

    @database_sync_to_async
    def get_user_from_token(self):
        """Decode JWT token from query parameters."""
        try:
            query_string = self.scope['query_string'].decode()
            token = None

            if 'token=' in query_string:
                token = query_string.split('token=')[1].split('&')[0]

            if not token:
                return None

            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            from authentication.models import User
            user = User.objects.get(id=payload['user_id'])
            return user
        except Exception as e:
            print(f"Token decode error: {e}")
            return None

    @database_sync_to_async
    def get_other_user_and_validate(self):
        """Validate that users share at least one non-pending case."""
        try:
            from authentication.models import User
            other_user = User.objects.get(id=self.other_user_id)

            # Check for at least one non-pending case between them
            cases_exist = Case.objects.filter(
                Q(client=self.user, lawyer=other_user) |
                Q(lawyer=self.user, client=other_user)
            ).exclude(status='pending').exists()

            if not cases_exist:
                print(f"No active cases between user {self.user.id} and user {self.other_user_id}")
                return None

            return other_user
        except Exception as e:
            print(f"User validation error: {e}")
            return None

    @database_sync_to_async
    def get_conversation_history(self):
        """Get all messages between the two users across all shared cases."""
        try:
            cases = Case.objects.filter(
                Q(client=self.user, lawyer=self.other_user) |
                Q(lawyer=self.user, client=self.other_user)
            ).exclude(status='pending')

            conversations = Conversation.objects.filter(case__in=cases)

            all_messages = Message.objects.filter(
                conversation__in=conversations
            ).order_by('timestamp')

            serializer = MessageSerializer(all_messages, many=True)
            return serializer.data
        except Exception as e:
            print(f"Error fetching conversation history: {e}")
            return []

    @database_sync_to_async
    def save_message(self, content):
        """Save message to the most recent case's conversation."""
        try:
            # Find most recent non-pending case
            case = Case.objects.filter(
                Q(client=self.user, lawyer=self.other_user) |
                Q(lawyer=self.user, client=self.other_user)
            ).exclude(status='pending').order_by('-updated_at').first()

            if not case:
                return None

            conversation, _ = Conversation.objects.get_or_create(case=case)

            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content
            )

            # Send notification
            recipient = self.other_user
            if recipient and recipient != self.user:
                sender_name = self.user.name or self.user.email
                preview = content[:80] + ("..." if len(content) > 80 else "")
                message_link = (
                    "/lawyermessage"
                    if recipient.role == "Lawyer"
                    else "/clientmessage"
                )
                send_notification(
                    user=recipient,
                    title=f"New message from {sender_name}",
                    message=preview,
                    notif_type="message",
                    link=message_link,
                )

            serializer = MessageSerializer(message)
            return serializer.data
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def _mark_user_online(self):
        """Mark user as online"""
        try:
            mark_user_online(
                self.user.id,
                self.user.name or self.user.email,
                self.group_name
            )
            broadcast_presence_update(self.group_name)
        except Exception as e:
            print(f"Error marking user online: {e}")

    @database_sync_to_async
    def _mark_user_offline(self):
        """Mark user as offline"""
        try:
            mark_user_offline(self.user.id)
            broadcast_presence_update(self.group_name)
        except Exception as e:
            print(f"Error marking user offline: {e}")
