from django.urls import path
from notifications.views import notificationsView

urlpatterns = [
    path("send-shit/", notificationsView.as_view(), name="notifications"),
]
