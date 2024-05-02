from django.urls import re_path

from notifications.classes.Consumer import Consumer

websocket_urlpatterns = [
    re_path(r"^ws/test/$", Consumer.as_asgi()),
]
