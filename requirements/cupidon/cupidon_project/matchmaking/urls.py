from django.urls import path, re_path
from . import views

urlpatterns = [
    path('game-request/', views.RequestGame.as_view(), name='GameRequest'),
    path('game-request-response/<int:requester>/<int:invited>/', views.RequestGameResponse.as_view(), name='GameRequestResponse'),
    path('game-availability/<int:requester>/', views.RestoreAvailability.as_view(), name='RestoreAvailability'),
]
