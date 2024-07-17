from django.urls import path
from notifications import views
# onlineView, notificationsView, friendshipView, friendshipRequestView, gameRequestView, tournamentRequestView, ava

urlpatterns = [
    path("online-states/", views.onlineView.as_view(), name="online states"),
    path('available-states/', views.availableFriendView.as_view()),
    path('self-ava/<int:requestee>/', views.availability),
    path("send-shit/", views.global_notification, name="notifications"),
    path("friendship/<int:requester>/", views.friendship),
    path("delete-friend-request/<int:requester>/", views.friendshipRefused),
    path("friend-request/<int:requester>/", views.friendshipRequest),
    path("delete-friend/<int:requester>/", views.friendshipSuppressed),
    path("game-request/<int:requester>/", views.gameRequest),
    path("tournament-request/<int:requester>/", views.tournamentRequest),
    path("update-profile/<int:requester>/", views.updateProfile),
]
