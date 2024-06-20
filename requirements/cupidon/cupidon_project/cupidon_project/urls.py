from django.urls import path, include
from shared.commonView import healthcheckView
from shared.commonView import socketConnectionView

urlpatterns = [
    path('matchmaking/', include('matchmaking.urls')),
    path('connectionView/', socketConnectionView.as_view()),
    path('metrics/', include('django_prometheus.urls')),
    path('healthcheck/', healthcheckView.as_view()),
]
