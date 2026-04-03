"""
User presence tracking for chat.
Tracks which users are currently online/offline per user-pair group.
"""

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# In-memory store of online users
# Structure: {
#   user_id: {
#     'username': str,
#     'channels': { channel_name: group_name }
#   }
# }
ONLINE_USERS = {}


def mark_user_online(user_id, username, group_name, channel_name):
    """Mark a user as online in a specific group with a specific channel"""
    if user_id not in ONLINE_USERS:
        ONLINE_USERS[user_id] = {
            'username': username,
            'channels': {}
        }
    
    # Track which group this specific connection (tab) is in
    ONLINE_USERS[user_id]['channels'][channel_name] = group_name


def mark_user_offline(user_id, channel_name):
    """Mark a specific connection as offline. Truly offline if no channels left."""
    if user_id in ONLINE_USERS:
        # Remove the specific channel connection
        if channel_name in ONLINE_USERS[user_id]['channels']:
            del ONLINE_USERS[user_id]['channels'][channel_name]
        
        # If no more active connections, remove the user from online store
        if not ONLINE_USERS[user_id]['channels']:
            del ONLINE_USERS[user_id]


def is_user_online(user_id):
    """Check if a user is online (has at least one active connection)"""
    return user_id in ONLINE_USERS


def get_online_users_for_group(group_name):
    """Get list of online users who are currently looking at a specific group"""
    online_users = []
    for user_id, info in ONLINE_USERS.items():
        # Check if the user has any connection in this specific group
        is_in_group = any(g == group_name for g in info['channels'].values())
        if is_in_group:
            online_users.append({
                'user_id': user_id,
                'username': info['username'],
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
