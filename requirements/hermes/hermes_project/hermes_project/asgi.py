"""
ASGI config for hermes_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from shared.Middleware import socketJWTIdentificationMiddleware
from django.urls import re_path
from notifications.classes.Consumer import Consumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hermes_project.settings')

websocket_urlpatterns = [
    re_path(r"session/(?P<Nick>[-\w]+)$", Consumer.as_asgi()),
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
