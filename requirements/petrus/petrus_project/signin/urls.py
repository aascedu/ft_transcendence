from django.urls import path
from signin.views import signinView, signupView, refreshView


urlpatterns = [
    path("signin/<str:string>", signinView.as_view()),
    path("signup", signupView.as_view()),
    path("JWT-refresh", refreshView.as_view()),
]
