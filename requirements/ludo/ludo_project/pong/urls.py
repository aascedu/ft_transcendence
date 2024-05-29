from django.urls import path
from pong.views import ongoingGames
from shared.commonView import socketConnectionView

urlpatterns = [
    path("connectionView/", socketConnectionView.as_view()),
    path("ongoingGames/", ongoingGames.as_view(), name="pong"),
]
