from django.urls import path, include
from shared.commonView import socketConnectionView, healthcheckView

urlpatterns = [
    path('metrics/', include('django_prometheus.urls')),
    path('connectionView/', socketConnectionView.as_view()),
    path('pong/', include('pong.urls')),
    path('healthcheck/', healthcheckView.as_view()),
]
