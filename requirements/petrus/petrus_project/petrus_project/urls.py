from django.urls import path, include
from shared.commonView import healthcheckView

urlpatterns = [
    path('healthcheck/', healthcheckView.as_view()),
    path('auth/', include("signin.urls")),
    path('metrics/', include('django_prometheus.urls')),
]
