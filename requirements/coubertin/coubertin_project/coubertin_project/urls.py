from django.urls import path, include

urlpatterns = [
    path('tournament/', include("tournament.urls")),
    path('metrics/', include('django_prometheus.urls')),
]
