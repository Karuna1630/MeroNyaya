from django.urls import path
from .consumers import ChatConsumer


# WebSocket URL patterns for the chat app
websocket_urlpatterns = [
    path('ws/chat/user/<int:user_id>/', ChatConsumer.as_asgi()),
]
