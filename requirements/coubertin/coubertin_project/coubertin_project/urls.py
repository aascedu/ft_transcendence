from django.urls import path, include
from shared.commonView import socketConnectionView

urlpatterns = [
    path('tournament/', include("tournament.urls")),
    path('connectionView/', socketConnectionView.as_view()),
    path('metrics/', include('django_prometheus.urls')),
]
