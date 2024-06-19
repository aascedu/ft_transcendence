from django.urls import path
from shared.commonView import socketConnectionView

urlpatterns = [
    path("connectionView/", socketConnectionView.as_view()),
]
