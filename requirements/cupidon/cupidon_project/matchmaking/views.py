from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views import View

def matchmaking(request):
    return render(request, 'matchmaking/waitingRoom.html')