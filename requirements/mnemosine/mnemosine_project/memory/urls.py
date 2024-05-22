from django.http.response import JsonResponse
from django.urls import path
from memory.views import (
        tournamentHistoryView,
        tournamentView,
        gameView,
        playerView,
)

from memory.models import Player

def view_db(request):
    json = {}
    for player in Player.objects.all():
        json |= {player.id: player.to_dict()}

    return JsonResponse(json)

urlpatterns = [
    path("tournament-history/<int:id>", tournamentHistoryView.as_view()),
    path("tournaments/<int:id>", tournamentView.as_view()),
    path("pong/games", gameView.as_view()),
    path("players/<int:id>", playerView.as_view()),
    path("db", view_db),
]
