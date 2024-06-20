from django.urls import path, include
from shared.commonView import healthcheckView

urlpatterns = [
    path('memory/', include("memory.urls")),
    path('metrics/', include('django_prometheus.urls')),
    path('healthcheck/', healthcheckView.as_view()),
]
