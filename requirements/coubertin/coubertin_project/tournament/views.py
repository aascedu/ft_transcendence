from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from tournament.classes.Tournament import Tournament, tournaments
import logging
import requests
# Invite someone to tournament
# Online friends not yet subscribed to tournament: avec Brieuc
# Get matches

class tournamentManagement(View): # Faire un patch pour modif le nb de joueurs ou autre ?
    def post(self, request): # Maybe we can set admin here instead.
        global tournaments

        data = request.data
        if 'Name' not in data or 'NumPlayers' not in data or 'Invited' not in data or 'Admin':
            return JsonResponse({'Err': "missing informations to create tournament"})
        tournamentName = data['Name']
        nbPlayers = data['NumPlayers']
        admin = data['Admin']
        invited = data['Invited']

        id = 0
        for id in tournaments:
            id += 1

        tournaments[id] = Tournament(tournamentName, nbPlayers, id, admin, invited) # 0 = admin id to get
        
        # Faire une requete a Hermes pour inviter les gens

        return JsonResponse({'Msg': "Tournament created"}) # Redirect on the tournament url, or join URL ?
    
    def get(self, request):
        data = request.data
        if 'id' not in data:
            return JsonResponse({'Err': "tournament id not provided"})
        
        if data['id'] == -1: # Pour avoir tous les tournois auxquels on peut s'inscrire
            response = {}
            for id in tournaments:
                if tournaments[id].state == 0:
                    response[id] = tournaments[id].toFront()
            return JsonResponse(response)
        else:
            return JsonResponse(tournaments[id].toFront())
        
    def patch(self, request):
        global tournaments

        data = request.data
        if 'NewName' not in data or 'TournamentId' not in data:
            return JsonResponse({'Err': "missing informations to change tournament name"})
        
        tournaments[data['TournamentId']].name = data['NewName']

        return JsonResponse({'Msg': "Tournament name changed"})

class tournamentEntry(View):
    def patch(self, request): # Leave
        global tournaments

        try:
            playerId = request.user.id
            data = request.data
            tournamentId = data['TournamentId']
            tournaments[tournamentId].removePlayer(playerId)
            
        except Exception as e:
            return JsonResponse({'Err': e.__str__()})

        return JsonResponse({})
    
    def post(self, request): #Join
        global tournaments
        
        try:
            playerId = request.user.id
            data = request.data
            TournamentId = data['TournamentId']
            if (TournamentId not in tournaments):
                return JsonResponse({'Err': "tournament does not exists"})
            tournaments[TournamentId].addPlayer(playerId)
            
        except Exception as e:
            return JsonResponse({'Err': e.__str__()})

        return JsonResponse({'Msg': "tournament joined"})
        
class inviteFriend(View):
    def post(self, request):
        global tournaments

        data = request.data
        if 'Invited' not in data or 'TournamentId' not in data:
            return JsonResponse({'Err': "tournament does not exists"})
        TournamentId = data['TournamentId']
        if (TournamentId not in tournaments):
            return JsonResponse({'Err': "tournament does not exists"})
        
        tournaments[TournamentId].invited.append(data['Invited']) 

        requests.post(
            'http://tournament-request/' + str(request.user.id), 
            json={'Tournament-Id': TournamentId,
                    'Tournament-Name': tournaments[TournamentId].name,
                    'Notified': data['Invited']})

class myTournaments(View):
    def get(self, request):
        userId = request.user.id
        response = []

        for i in tournaments:
            if tournaments[i].userParticipating(userId):
                t = {}
                t['Name'] = tournaments[i].name
                t['Id'] = tournaments[i].id
                response.append(t)

        return JsonResponse(response)

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
    print('Tournament id: ', data['tournamentId'])
    game = data['game']
    print('Winner is ', game['Winner'], ' with a score of ', game['Winner-score'])
    print('Loser is ', game['Loser'], ' with a score of ', game['Loser-score'])