from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Q
import logging

from .models import Notification
from .serializers import NotificationSerializer


logger = logging.getLogger(__name__)


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

    if channel_layer is not None:
        try:
            async_to_sync(channel_layer.group_send)(
                f"notifications_{user.id}",
                {
                    'type': 'send_notification',   # maps to NotificationConsumer.send_notification
                    'notification': serialized,
                }
            )
        except Exception:
            # Persisting DB notification is primary; websocket is best-effort.
            logger.exception("Failed to push notification via channel layer for user_id=%s", user.id)
    else:
        logger.warning("Channel layer is not configured; notification saved without realtime push for user_id=%s", user.id)

    return notification


def notify_admins(title, message, notif_type='system', link=None, exclude_user_ids=None):
    """
    Send the same notification payload to all active admin users.

    Args:
        title            : Short title string
        message          : Full message string
        notif_type       : One of Notification.TYPE_CHOICES values
        link             : Frontend route to navigate to when clicked
        exclude_user_ids : Optional iterable of user IDs to skip
    """
    try:
        from authentication.models import User

        admin_users = User.objects.filter(
            Q(is_superuser=True) | Q(is_staff=True) | Q(role=User.UserRoles.SUPERADMIN),
            is_active=True,
        ).distinct()

        if exclude_user_ids:
            admin_users = admin_users.exclude(id__in=list(exclude_user_ids))

        for admin_user in admin_users:
            try:
                send_notification(
                    user=admin_user,
                    title=title,
                    message=message,
                    notif_type=notif_type,
                    link=link,
                )
            except Exception:
                # Notification delivery should never break business endpoints.
                logger.exception("Failed to send admin notification to user_id=%s", admin_user.id)
    except Exception:
        # Admin fan-out must not break business endpoints.
        logger.exception("Failed to fan out admin notifications")
