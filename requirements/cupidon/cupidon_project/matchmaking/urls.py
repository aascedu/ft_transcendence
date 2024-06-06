from django.urls import path, re_path
from . import views

urlpatterns = [
    path('game-request/', views.RequestGame.as_view(), name='GameRequest'),
    path('game-request-response/<int:requester>/<int:notified>/', views.RequestGameResponse.as_view(), name='GameRequestResponse'),
]
