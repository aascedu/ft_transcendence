from django.shortcuts import render
from django.views import View
from tournament.classes.Tournament import Tournament, tournaments
from shared.utils import JsonResponseLogging as JsonResponse, JsonUnauthorized, JsonBadRequest, JsonNotFound

# Invite someone to tournament
# Online friends not yet subscribed to tournament: avec Brieuc
# Get matches

class tournamentManagement(View): # Faire un patch pour modif le nb de joueurs ou autre ?
    def get(self, request):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Connect yourself to fetch")
        data = request.data
        if 'id' not in data:
            return JsonBadRequest(request, {'Err': "tournament id not provided"})

        if data['id'] == -1: # Pour avoir tous les tournois auxquels on peut s'inscrire
            response = {}
            for id in tournaments:
                if tournaments[id].state == 0:
                    response[id] = tournaments[id].toFront()
            return JsonResponse(request, response)
        else:
            return JsonResponse(request, tournaments[data['id']].toFront())

    def post(self, request): # Maybe we can set admin here instead.
        global tournaments
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified players can post tournaments')

        data = request.data
        try:
            tournamentName = data['Name']
            nbPlayers = data['NumPlayers']
            admin = data['Admin']
            invited = data['Invited']
        except (KeyError, TypeError, ValueError) as e:
            return JsonBadRequest(request, {'Err': f'missing {e} to create tournament'})

        id = 0
        for id in tournaments:
            id += 1

        tournaments[id] = Tournament(tournamentName, nbPlayers, id, admin, invited) # 0 = admin id to get

        # Faire une requete a Hermes pour inviter les gens

        return JsonResponse(request, {'Msg': "Tournament created"}) # Redirect on the tournament url, or join URL ?

    def patch(self, request):
        if request.user.is_admin is False:
            return JsonUnauthorized(request, 'Only admin can patch ongoing tournaments')
        global tournaments
        data = request.data
        try:
            tournaments[data['TournamentId']].name = data['NewName']
        except KeyError as e:
            return JsonBadRequest(request, f'missing key {e}')
        return JsonResponse(request, {'Msg': "Tournament name changed"})

class tournamentEntry(View):
    def patch(self, request): # Leave
        global tournaments

        try:
            playerId = request.user.id
            data = request.data
            tournamentId = data['TournamentId']
            tournaments[tournamentId].removePlayer(playerId)
        except KeyError as e:
            return JsonBadRequest(request, f'missing key {e}')
        return JsonResponse(request, {"Tournament": "Patched"})

    def post(self, request): #Join
        global tournaments

        playerId = request.user.id
        data = request.data
        try:
            TournamentId = data['TournamentId']
        except KeyError as e:
            return JsonBadRequest(request, f'missing key {e}')
        try:
            TournamentId = int(TournamentId)
        except (TypeError, ValueError) as e:
            return JsonBadRequest(request, f'bad content {e}')
        if (TournamentId not in tournaments):
            return JsonNotFound(request, "tournament does not exists")
        tournaments[TournamentId].addPlayer(playerId)
        return JsonResponse(request, {'Msg': "tournament joined"})

class inviteFriend(View):
    def post(self, request):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can invite friends')

        global tournaments

        data = request.data

        try:
            TournamentId = data['TournamentId']
            invited = data['Invited']
        except KeyError as e:
            return JsonBadRequest(request, f'missing key {e}')
        try:
            TournamentId = int(TournamentId)
            invited = int(invited)
        except (TypeError, ValueError) as e:
            return JsonBadRequest(request, f'bad content {e}')

        TournamentId = data['TournamentId']
        if (TournamentId not in tournaments):
            return JsonNotFound(request, 'tournament does not exists')

        tournaments[TournamentId].invited.append(invited)

        # Send a Hermes
        return JsonResponse

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
    print('Tournament name: ', data['tournamentName'])
    game = data['game']
    print('Player ', game['Player1'], ' had a score of ', game['Score1'])
    print('Player ', game['Player2'], ' had a score of ', game['Score2'])
