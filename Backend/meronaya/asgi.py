import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from notification.routing import websocket_urlpatterns as notification_urlpatterns
from chat.routing import websocket_urlpatterns as chat_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meronaya.settings')

# Combine WebSocket URL patterns from all apps
all_websocket_urlpatterns = notification_urlpatterns + chat_urlpatterns

application = ProtocolTypeRouter({
    # Standard HTTP requests are handled by Django as usual
    'http': get_asgi_application(),

    # WebSocket connections are routed based on URL patterns
    'websocket': AllowedHostsOriginValidator(
        URLRouter(all_websocket_urlpatterns)
    ),
})
