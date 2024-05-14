from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from tournament.classes.Tournament import Tournament, tournaments

# Faire des fonctions quand on a juste un post.
# Invite someone to tournament
# Online friends not yet subscribed to tournament: avec Brieuc
# Get matches

class tournamentManagement(View): #Faire un patch pour modif le nb de joueurs ou autre ?
    def post(self, request): # Maybe we can set admin here instead.
        global tournaments

        data = request.data
        if 'tournamentName' not in data or 'nbPlayers' not in data:
            return JsonResponse({'Err': "tournamentName or nbPlayers not provided"})
        tournamentName = data['tournamentName']
        nbPlayers = data['nbPlayers']

        id = 0
        while id in tournaments:
            id += 1

        tournaments[id] = Tournament(tournamentName, nbPlayers, id, 0) # 0 = admin id to get
        return JsonResponse({}) # Redirect on the tournament url, or join URL ?
    
    def get(self, request):
        response = {}
        for id in tournaments:
            if tournaments[id].state == 0:
                response[id] = tournaments[id].toDict()
        return JsonResponse(response)

class tournamentEntry(View):
    def patch(self, request): # Leave
        global tournaments

        try:
            playerId = request.user.id
            data = request.data
            tournamentId = data['tournamentId']
            tournaments[tournamentId].removePlayer(playerId)
            
        except Exception as e:
            return JsonResponse({'Err': e.__str__()})

        return JsonResponse({})
    
    def post(self, request): #Join
        global tournaments
        
        try:
            playerId = request.user.id
            data = request.data
            tournamentId = data['tournamentId']
            if (tournamentId not in tournaments):
                return JsonResponse({'Err': "tournament does not exists"})
            tournaments[tournamentId].addPlayer(playerId)
            
        except Exception as e:
            return JsonResponse({'Err': e.__str__()})

        return JsonResponse({})
        
class gameResult(View): # We need to remove the loser from the player list
    def post(self, request):
        global tournaments

        data = request.data
        if 'tournamentId' not in data or 'game' not in data:
            return JsonResponse({'Err': "tournamentId or game not provided"})
        printData(data)
        tournament = tournaments[data['tournamentId']]
        tournament.addGame(data['game']) # Game is a dictionnary
        return JsonResponse({})

def tournamentHome(request, tournamentId):
    return render(request, 'tournament/home.html', {'tournamentId': tournamentId})


############## Debug ##############
def printData(data):
    print('Tournament name: ', data['tournamentName'])
    game = data['game']
    print('Player ', game['Player1'], ' had a score of ', game['Score1'])
    print('Player ', game['Player2'], ' had a score of ', game['Score2'])