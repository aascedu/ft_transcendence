from django.shortcuts import render
from django.views import View

# Create your views here.

def notifications(request):
    return render(request, 'notifications/notifications.html')
