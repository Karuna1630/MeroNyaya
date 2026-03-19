import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meronaya.settings')

# Initialize Django first
django_asgi_app = get_asgi_application()

# Import routing modules AFTER Django is initialized
from notification.routing import websocket_urlpatterns as notification_urlpatterns
from chat.routing import websocket_urlpatterns as chat_urlpatterns

# Combine WebSocket URL patterns from all apps
all_websocket_urlpatterns = notification_urlpatterns + chat_urlpatterns

application = ProtocolTypeRouter({
    # Standard HTTP requests are handled by Django as usual
    'http': django_asgi_app,

    # WebSocket connections are routed based on URL patterns
    'websocket': AllowedHostsOriginValidator(
        URLRouter(all_websocket_urlpatterns)
    ),
})
