from django.urls import path
from pong.views import pong
from shared.commonView import socketConnectionView

urlpatterns = [
    path("games/<str:roomName>/", pong, name="pong"),
    path("connectionView/", socketConnectionView.as_view()),
]
