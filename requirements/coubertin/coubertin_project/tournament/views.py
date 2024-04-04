from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views import View
from tournament.classes.Tournament import Tournament, tournaments
import json
import io

class createTournament(View): 
    def post(self, request): # Maybe we can set admin here instead.
        global tournaments

        data = request.data
        if 'tournamentName' not in data or 'nbPlayers' not in data:
            return JsonResponse({'Err': "tournamentName or nbPlayers not provided"})
        tournamentName = data['tournamentName']
        nbPlayers = data['nbPlayers']
        tournaments[tournamentName] = Tournament(tournamentName, nbPlayers)
        return JsonResponse({}) # Redirect on the tournament url ?

class joinTournament(View):
    def post(self, request):
        global tournaments
        
        try:
            playerId = request.user.id
            data = request.data
            tournamentName = data['tournamentName']
            if (tournamentName not in tournaments):
                return JsonResponse({'Err': "tournament does not exists"})
            tournaments[tournamentName].addPlayer(playerId)
            
        except Exception as e:
            return JsonResponse({'Err': e.__str__()})

        return JsonResponse({})

def printData(data):
    print('Tournament name: ', data['tournamentName'])
    game = data['game']
    print('Player ', game['Player1'], ' had a score of ', game['Score1'])
    print('Player ', game['Player2'], ' had a score of ', game['Score2'])

class gameResult(View): # We need to remove the loser from the player list
    def post(self, request):
        global tournaments

        data = request.data
        if 'tournamentName' not in data or 'game' not in data:
            return JsonResponse({'Err': "tournamentName or game not provided"})
        printData(data)
        tournament = tournaments[data['tournamentName']]
        tournament.addGame(data['game']) # Game is a dictionnary
        return JsonResponse({})

def tournamentHome(request, tournamentName):
    return render(request, 'tournament/home.html', {'tournamentName': tournamentName})
