"""
User presence tracking for chat.
Tracks which users are currently online/offline per user-pair group.
"""

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# In-memory store of online users {user_id: {'username': str, 'group_name': str}}
ONLINE_USERS = {}


def mark_user_online(user_id, username, group_name):
    """Mark a user as online in a specific group"""
    ONLINE_USERS[user_id] = {
        'username': username,
        'group_name': group_name
    }


def mark_user_offline(user_id):
    """Mark a user as offline"""
    if user_id in ONLINE_USERS:
        del ONLINE_USERS[user_id]


def is_user_online(user_id):
    """Check if a user is online"""
    return user_id in ONLINE_USERS


def get_online_users_for_group(group_name):
    """Get list of online users for a specific group"""
    online_users = []
    for user_id, user_info in ONLINE_USERS.items():
        if user_info.get('group_name') == group_name:
            online_users.append({
                'user_id': user_id,
                'username': user_info['username'],
                'is_online': True
            })
    return online_users


def broadcast_presence_update(group_name):
    """Broadcast presence update to all clients in a group"""
    channel_layer = get_channel_layer()
    online_users = get_online_users_for_group(group_name)

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'presence_update',
            'online_users': online_users
        }
    )
