from django.urls import path
from .consumers import NotificationConsumer


# WebSocket URL patterns for the notification app
websocket_urlpatterns = [
    path('ws/notifications/', NotificationConsumer.as_asgi()),
]
