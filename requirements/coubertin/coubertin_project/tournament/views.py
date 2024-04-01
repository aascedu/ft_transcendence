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
        tournamentName = data.get('tournamentName', None)
        nbPlayers = data.get('nbPlayers', None)
        tournaments[tournamentName] = Tournament(tournamentName, nbPlayers)
        return JsonResponse({}) # Redirect on the tournament url ?

class joinTournament(View):
    def post(self, request):
        global tournaments
        
        data = request.data
        tournamentName = data.get('tournamentName', None)
        if (tournamentName not in tournaments):
            return JsonResponse({'Err': 'tournament does not exists'})
        if (tournaments[tournamentName].nbPlayers == len(tournaments[tournamentName].players)):
            return JsonResponse({'Err': 'tournament is already full'})
        try:
            if 'playerName' in data:
                tournaments[tournamentName].addPlayer(data['playerName'])
            else:
                return JsonResponse({'Err': "no player name provided"})
        except Exception as e:
            return JsonResponse({'Err': e.__str__})
        return JsonResponse({})

def printData(data):
    print('Tournament name: ', data.get('tournamentName', None))
    game = data.get('game', None)
    print('Player ', game['Player1'], ' had a score of ', game['Score1'])
    print('Player ', game['Player2'], ' had a score of ', game['Score2'])

class gameResult(View): # We need to remove the loser from the player list
    def post(self, request):
        global tournaments

        data = request.data
        printData(data)
        tournament = tournaments[data.get('tournamentName', None)]
        tournament.addGame(data.get('game', None)) # Game is a dictionnary
        return JsonResponse({})

def tournamentHome(request, tournamentName):
    return render(request, 'tournament/home.html', {'tournamentName': tournamentName})
