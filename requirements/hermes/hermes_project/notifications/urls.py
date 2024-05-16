from django.urls import path
from notifications.views import onlineView, notificationsView, friendshipView, friendshipRequestView, gameRequestView

urlpatterns = [
    path("online-states", onlineView.as_view(), name="online states"),
    path("send-shit/", notificationsView.as_view(), name="notifications"),
    path("friendship/<int:requester>", friendshipView.as_view()),
    path("friend-request/<int:requester>", friendshipRequestView.as_view()),
    path("game-request/<int:requester>", gameRequestView.as_view()),
]
