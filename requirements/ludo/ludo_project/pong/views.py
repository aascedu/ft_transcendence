from django.shortcuts import render

# Create your views here.

def pong(request, roomName):
    id = request.user.id
    return render(request, 'pong/pong.html', {"roomName": roomName, "id": id})
