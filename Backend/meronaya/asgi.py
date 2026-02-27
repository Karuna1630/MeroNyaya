import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from notification.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meronaya.settings')

application = ProtocolTypeRouter({
    # Standard HTTP requests are handled by Django as usual
    'http': get_asgi_application(),

    # WebSocket connections are routed to the notification consumer
    'websocket': AllowedHostsOriginValidator(
        URLRouter(websocket_urlpatterns)
    ),
})
