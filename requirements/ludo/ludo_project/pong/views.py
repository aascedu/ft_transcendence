from django.shortcuts import render

# Create your views here.

def pong(request, roomName):
    id = request.user.id # Check if authenticated
    return render(request, 'pong/pong.html', {"roomName": roomName, "id": id})

