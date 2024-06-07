import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from shared.Middleware import socketJWTIdentificationMiddleware
from django.urls import re_path
from matchmaking.Consumer import Consumer

websocket_urlpatterns = [
    re_path(r"matchmaking/ws/(?P<requester>[\d])/(?P<invited>[\d])/$", Consumer.as_asgi()),
]

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cupidon_project.settings')

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
