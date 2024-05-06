from django.http import JsonResponse
from django.urls import path
from memory.views import (
        tournamentView,
        gameView,
        playerView,
)

urlpatterns = [
    path("pong/tournaments", tournamentView.as_view()),
    path("pong/games", gameView.as_view()),
    path("players/<int:id>", playerView.as_view()),
]
