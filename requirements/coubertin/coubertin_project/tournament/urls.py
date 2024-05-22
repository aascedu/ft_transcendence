from django.urls import path

from . import views

urlpatterns = [
    path("infos/", views.tournamentManagement.as_view(), name="createTournament"),
    path("entry/", views.tournamentEntry.as_view(), name="entry"),
    path("invite/", views.inviteFriend.as_view(), name="invite"),
    path("mytournaments/", views.myTournaments.as_view(), name="myTournaments"),
    path("gameResult/", views.gameResult.as_view(), name="gameresult"),
    path("home/<str:tournamentId>/", views.tournamentHome, name="tournamentHome"),
]