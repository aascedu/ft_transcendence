from django.urls import path
from user_management.views import view_db, createUser, userInfoView, friendView

urlpatterns = [
    path("users/<int:id>", userInfoView.as_view()),
    path("friends/<int:id>", friendView.as_view()),
    path("test", createUser),
    path("view-db", view_db)
]
