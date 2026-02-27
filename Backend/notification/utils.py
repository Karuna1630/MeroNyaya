from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification
from .serializers import NotificationSerializer


def send_notification(user, title, message, notif_type='system', link=None):
    """
    Create a Notification record and push it to the user's WebSocket group.

    Call this from any view or signal after a meaningful action happens.

    Args:
        user        : User instance who should receive the notification
        title       : Short title string
        message     : Full message string
        notif_type  : One of 'case', 'appointment', 'message', 'payment', 'alert', 'system'
        link        : Frontend route to navigate to when clicked (e.g. '/client/case/5')
    """
    # Persist the notification in the database
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notif_type=notif_type,
        link=link,
    )

    # Push to the user's channel group so their open browser tab gets it instantly
    channel_layer = get_channel_layer()
    serialized = NotificationSerializer(notification).data

    async_to_sync(channel_layer.group_send)(
        f"notifications_{user.id}",
        {
            'type': 'send_notification',   # maps to NotificationConsumer.send_notification
            'notification': serialized,
        }
    )

    return notification
