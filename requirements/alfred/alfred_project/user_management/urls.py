from django.http import JsonResponse
from django.urls import path
from user_management.views import view_db, userInfoView, friendView, avatarView


urlpatterns = [
    path("users/<int:id>", userInfoView.as_view()),
    path("friends/<int:id>", friendView.as_view()),
    path("avatar/<int:id>", avatarView.as_view()),
    path("view-db", view_db)
]
