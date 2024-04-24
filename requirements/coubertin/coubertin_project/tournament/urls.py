from django.urls import path

from . import views

urlpatterns = [
    path("create/", views.createTournament.as_view(), name="createTournament"),
    path("join/", views.joinTournament.as_view(), name="joinTournament"),
    path("leave/", views.leaveTournament.as_view(), name="leaveTournament"),
    path("allTournaments", views.getTournaments.as_view(), name="getTournaments"),
    path("gameResult/", views.gameResult.as_view(), name="gameresult"),
    path("home/<str:tournamentId>/", views.tournamentHome, name="tournamentHome"),
]