import os

from django.urls import re_path
from pong.classes.Consumer import Consumer
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from shared.Middleware import socketJWTIdentificationMiddleware

websocket_urlpatterns = [
    re_path(r"pong/ws/(?P<roomName>[-\w]+)/$", Consumer.as_asgi()),
]

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ludo_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket":
        socketJWTIdentificationMiddleware(
        AllowedHostsOriginValidator(
            URLRouter(
                websocket_urlpatterns
            )
        )),
})
