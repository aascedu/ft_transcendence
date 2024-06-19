from django.urls import path

from . import views

urlpatterns = [
    path("available-tournaments/", views.availableTournamentView.as_view(), name="available tournament"),
    path("infos/<int:id>/", views.tournamentManagement.as_view(), name="createTournament"),
    path("entry/<int:tournamentId>/<int:playerId>/", views.tournamentEntry.as_view(), name="entry"),
    path("invite/<int:tournamentId>/", views.inviteFriend.as_view(), name="invite"),
    path("my-tournaments/", views.myTournaments.as_view(), name="myTournaments"),
    path("gameResult/", views.gameResult.as_view(), name="gameresult"),
    path("is-participating/<int:tournamentId>/", views.inTournament.as_view(), name="isParticipating"),
]

