import json
import jwt

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.conf import settings

from .models import Notification
from .serializers import NotificationSerializer


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications.
    Each user is placed in their own group: notifications_<user_id>
    """

    async def connect(self):
        # Authenticate the user from the JWT token passed as query param
        self.user = await self.get_user_from_token()

        if self.user is None:
            # Reject unauthenticated connections
            await self.close()
            return

        # Each user has their own notification group
        self.group_name = f"notifications_{self.user.id}"

        # Join the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # Send all unread notifications immediately on connect
        unread = await self.get_unread_notifications()
        await self.send(text_data=json.dumps({
            'type': 'initial_notifications',
            'notifications': unread
        }))

    async def disconnect(self, close_code):
        # Leave the group on disconnect
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle messages from the client (mark read, mark all read)"""
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        action = data.get('action')

        if action == 'mark_read':
            notif_id = data.get('id')
            if notif_id:
                await self.mark_notification_read(notif_id)
                await self.send(text_data=json.dumps({
                    'type': 'marked_read',
                    'id': notif_id
                }))

        elif action == 'mark_all_read':
            await self.mark_all_notifications_read()
            await self.send(text_data=json.dumps({
                'type': 'marked_all_read'
            }))

        elif action == 'delete':
            notif_id = data.get('id')
            if notif_id:
                await self.delete_notification(notif_id)
                await self.send(text_data=json.dumps({
                    'type': 'deleted',
                    'id': notif_id
                }))

    async def send_notification(self, event):
        """
        Called by the channel layer when a new notification is pushed.
        Forwards the notification payload to the WebSocket client.
        """
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': event['notification']
        }))

    # ── Database helpers ──────────────────────────────────────────────────────

    @database_sync_to_async
    def get_user_from_token(self):
        """Decode the JWT from the query string and return the user"""
        from authentication.models import User

        query_string = self.scope.get('query_string', b'').decode()
        params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
        token = params.get('token')

        if not token:
            return None

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            return User.objects.get(id=user_id)
        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            return None

    @database_sync_to_async
    def get_unread_notifications(self):
        """Return unread notifications for this user as a list of dicts"""
        notifications = Notification.objects.filter(
            user=self.user,
            is_read=False
        ).order_by('-created_at')[:50]

        return NotificationSerializer(notifications, many=True).data

    @database_sync_to_async
    def mark_notification_read(self, notif_id):
        """Mark a single notification as read"""
        Notification.objects.filter(
            id=notif_id,
            user=self.user
        ).update(is_read=True)

    @database_sync_to_async
    def mark_all_notifications_read(self):
        """Mark all notifications for this user as read"""
        Notification.objects.filter(
            user=self.user,
            is_read=False
        ).update(is_read=True)

    @database_sync_to_async
    def delete_notification(self, notif_id):
        """Delete a single notification"""
        Notification.objects.filter(
            id=notif_id,
            user=self.user
        ).delete()
