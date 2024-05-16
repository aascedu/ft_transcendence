from django.shortcuts import render, redirect

def matchmaking(request):
    print(request.user.error)
    print(request.data.get('Err', None))
    id = request.user.id # Try catch ?
    print("user id: ", id)
    return render(request, "matchmaking/waitingRoom.html", {'Id': id})
