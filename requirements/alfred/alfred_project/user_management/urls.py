from django.http import JsonResponse
from django.urls import path

from user_management.views import view_db, userInfoView, friendView, avatarView, serve_avatar

urlpatterns = [
    path("users/<int:id>", userInfoView.as_view()),
    path("friends/<int:id>", friendView.as_view()),
    path("avatar/<int:id>", avatarView.as_view()),
    path("media/<str:filename>", serve_avatar),
    path("view-db", view_db)
]
