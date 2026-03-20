import json
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.conf import settings
from case.models import Case
from .models import Message, Conversation
from .serializers import MessageSerializer
from .presence import mark_user_online, mark_user_offline, broadcast_presence_update
from notification.utils import send_notification


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for case chat.
    Group name: chat_<case_id>
    
    Features:
    - Authenticate user via JWT token from query params
    - Verify user is part of the case (client or lawyer)
    - Verify case status is 'accepted'
    - Send conversation history on connection
    - Broadcast new messages in real-time
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        # Extract user from JWT token
        self.user = await self.get_user_from_token()
        self.case_id = self.scope['url_route']['kwargs']['case_id']
        
        if self.user is None:
            # Reject unauthenticated connections
            await self.close()
            return
        
        # Validate user is part of the case and case is accepted
        case = await self.get_case_and_validate()
        
        if case is None:
            # Reject if not authorized or case not accepted
            await self.close()
            return
        
        # Create group name for this case
        self.group_name = f'chat_{self.case_id}'
        
        # Join WebSocket group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        # Accept the connection
        await self.accept()
        
        # Mark user as online in the case (wrap in database_sync_to_async to avoid blocking)
        await self._mark_user_online()
        
        # Send conversation history on initial connection
        messages = await self.get_conversation_history()
        await self.send(text_data=json.dumps({
            'type': 'initial_messages',
            'messages': messages
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'group_name'):
            # Mark user as offline
            if hasattr(self, 'user'):
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
        """
        Handle message broadcast from group.
        Called when group_send is triggered with type='chat_message'
        """
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))
    
    async def presence_update(self, event):
        """
        Handle presence update broadcast from group.
        Called when group_send is triggered with type='presence_update'
        """
        await self.send(text_data=json.dumps({
            'type': 'presence_update',
            'online_users': event['online_users']
        }))
    
    # ── Database helper methods ──────────────────────────────────────────────────
    
    @database_sync_to_async
    def get_user_from_token(self):
        """
        Decode JWT token from query parameters.
        Expected format: ?token=<jwt_token>
        """
        try:
            query_string = self.scope['query_string'].decode()
            token = None
            
            # Extract token from query string
            if 'token=' in query_string:
                token = query_string.split('token=')[1].split('&')[0]
            
            if not token:
                return None
            
            # Decode JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            from authentication.models import User
            user = User.objects.get(id=payload['user_id'])
            return user
        except Exception as e:
            print(f"Token decode error: {e}")
            return None
    
    @database_sync_to_async
    def get_case_and_validate(self):
        """
        Validate that:
        1. Case exists
        2. User is either client or lawyer on the case
        3. Case status is 'accepted'
        """
        try:
            case = Case.objects.get(id=self.case_id)
            
            # Check user is client or lawyer on this case
            if self.user != case.client and self.user != case.lawyer:
                print(f"User {self.user.id} not part of case {case.id}")
                return None
            
            # Check case is accepted
            if case.status != 'accepted':
                print(f"Case {case.id} status is {case.status}, not accepted")
                return None
            
            return case
        except Case.DoesNotExist:
            print(f"Case {self.case_id} does not exist")
            return None
        except Exception as e:
            print(f"Case validation error: {e}")
            return None
    
    @database_sync_to_async
    def get_conversation_history(self):
        """
        Get all messages for this conversation.
        Returns serialized list of messages.
        """
        try:
            conversation = Conversation.objects.get(case_id=self.case_id)
            messages = conversation.messages.all()
            serializer = MessageSerializer(messages, many=True)
            return serializer.data
        except Conversation.DoesNotExist:
            # Conversation doesn't exist yet, return empty list
            return []
        except Exception as e:
            print(f"Error fetching conversation history: {e}")
            return []
    
    @database_sync_to_async
    def save_message(self, content):
        """
        Save message to database and return serialized message.
        Returns serialized message object or None if error occurs.
        """
        try:
            # Create or get conversation
            conversation, _ = Conversation.objects.get_or_create(case_id=self.case_id)
            
            # Create message
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content
            )

            # Notify the other participant about the new message.
            case = conversation.case
            recipient = case.lawyer if self.user == case.client else case.client
            if recipient and recipient != self.user:
                sender_name = self.user.name or self.user.email
                preview = content[:80] + ("..." if len(content) > 80 else "")
                message_link = (
                    f"/lawyermessage?caseId={case.id}"
                    if recipient.role == "Lawyer"
                    else f"/clientmessage?caseId={case.id}"
                )
                send_notification(
                    user=recipient,
                    title=f"New message from {sender_name}",
                    message=preview,
                    notif_type="message",
                    link=message_link,
                )
            
            # Serialize and return
            serializer = MessageSerializer(message)
            return serializer.data
        except Exception as e:
            print(f"Error saving message: {e}")
            return None
    
    @database_sync_to_async
    def _mark_user_online(self):
        """Mark user as online (async wrapper)"""
        try:
            mark_user_online(
                self.user.id,
                self.user.get_full_name() or self.user.username,
                [self.case_id]
            )
            # Broadcast presence update
            broadcast_presence_update(self.case_id)
        except Exception as e:
            print(f"Error marking user online: {e}")
    
    @database_sync_to_async
    def _mark_user_offline(self):
        """Mark user as offline (async wrapper)"""
        try:
            mark_user_offline(self.user.id)
            # Broadcast presence update
            broadcast_presence_update(self.case_id)
        except Exception as e:
            print(f"Error marking user offline: {e}")
