from django.http import JsonResponse
from django.urls import path
from memory.views import (
        tournamentView,
        gameView,
        playerView,
)

from memory.models import Player, Game

def view_db(request):
    return JsonResponse({"Id": request.user.id, "Players":
                    [e.to_dict() for e in Player.objects.all()]
                         })


def view_game_db(request):
    return JsonResponse({"Games":
        [e.to_dict() for e in Game.objects.all()]
    })

urlpatterns = [
    path("view-db", view_db),
    path("view-game-db", view_game_db),
    path("pong/tournaments/<int:id>", tournamentView.as_view()),
    path("pong/games", gameView.as_view()),
    path("players/<int:id>", playerView.as_view()),
]
