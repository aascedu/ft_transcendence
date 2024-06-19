from django.urls import path, include
from shared.commonView import healthcheckView
from shared.commonView import socketConnectionView

urlpatterns = [
    path('metrics/', include('django_prometheus.urls')),
    path('connectionView/', socketConnectionView.as_view()),
    path('notif/', include('notifications.urls')),
    path('healthcheck/', healthcheckView.as_view()),
]
