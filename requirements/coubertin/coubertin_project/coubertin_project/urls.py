from django.urls import path, include
from shared.commonView import healthcheckView
from shared.commonView import socketConnectionView

urlpatterns = [
    path('tournament/', include("tournament.urls")),
    path('healthcheck/', healthcheckView.as_view()),
    path('connectionView/', socketConnectionView.as_view()),
    path('metrics/', include('django_prometheus.urls')),
]
