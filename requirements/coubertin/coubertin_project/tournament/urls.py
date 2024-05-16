from django.urls import path

from . import views

urlpatterns = [
    path("infos/", views.tournamentManagement.as_view(), name="createTournament"),
    path("entry/", views.tournamentEntry.as_view(), name="leaveTournament"),
    path("gameResult/", views.gameResult.as_view(), name="gameresult"),
    path("home/<str:tournamentId>/", views.tournamentHome, name="tournamentHome"),
    path("test/", views.testView, name="test"),
]