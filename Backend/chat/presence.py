"""
User presence tracking for chat
Tracks which users are currently online/offline
"""

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# In-memory store of online users {user_id: {'username': str, 'case_ids': [int]}}
ONLINE_USERS = {}


def mark_user_online(user_id, username, case_ids=None):
    """Mark a user as online"""
    if case_ids is None:
        case_ids = []
    ONLINE_USERS[user_id] = {
        'username': username,
        'case_ids': case_ids
    }


def mark_user_offline(user_id):
    """Mark a user as offline"""
    if user_id in ONLINE_USERS:
        del ONLINE_USERS[user_id]


def is_user_online(user_id):
    """Check if a user is online"""
    return user_id in ONLINE_USERS


def get_online_users_for_case(case_id):
    """Get list of online users for a specific case"""
    online_users = []
    for user_id, user_info in ONLINE_USERS.items():
        if case_id in user_info.get('case_ids', []):
            online_users.append({
                'user_id': user_id,
                'username': user_info['username'],
                'is_online': True
            })
    return online_users


def broadcast_presence_update(case_id):
    """Broadcast presence update to all clients in a case"""
    channel_layer = get_channel_layer()
    online_users = get_online_users_for_case(case_id)
    
    async_to_sync(channel_layer.group_send)(
        f'chat_{case_id}',
        {
            'type': 'presence_update',
            'online_users': online_users
        }
    )
