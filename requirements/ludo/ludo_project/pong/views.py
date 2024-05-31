from django.views import View
from shared.utils import JsonBadRequest, JsonForbidden, JsonUnallowedMethod, JsonUnauthorized
from shared.utils import JsonResponseLogging as JsonResponse
from pong.classes.Match import matches

# Create your views here.

class ongoingGames(View):
    def get(self, request):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "You need to be logged to see ongoing games")
        if 'Id' not in request:
            return JsonBadRequest(request, "You need the id of the player to see his game")
        
        for roomName in matches:
            count = roomName.count('-')
            p1 = self.roomName.split('-')[count - 2]
            p2 = self.roomName.split('-')[count - 1]

            if request['Id'] == p1 or request['Id'] == p2:
                return JsonResponse({'Room': roomName})
            
        return JsonResponse({'Info': "This player is not currently in game"})