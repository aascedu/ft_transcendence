from django.urls import path, include

urlpatterns = [
    path('memory/', include("memory.urls")),
    path('metrics/', include('django_prometheus.urls')),
]
