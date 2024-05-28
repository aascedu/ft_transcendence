import os
from django.urls import re_path
from tournament.Consumer import Consumer
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from shared.Middleware import socketJWTIdentificationMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coubertin_project.settings')

websocket_urlpatterns = [
    re_path(r"tournament/ws/(?P<roomName>[-\w]+)/$", Consumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket":
        socketJWTIdentificationMiddleware(
        AllowedHostsOriginValidator(
        URLRouter(
            websocket_urlpatterns
        ))),
})
