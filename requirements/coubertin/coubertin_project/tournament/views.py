from django.views import View
from tournament.Tournament import Tournament, tournaments
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import requests
from shared.utils import JsonResponseLogging as JsonResponse, JsonUnauthorized, JsonBadRequest, JsonNotFound, JsonErrResponse

class availableTournamentView(View):
    def get(self, request):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Connect yourself to fetch")
        response = {}
        for tournament in tournaments:
            if tournaments[tournament].started == False and request.user.id not in tournaments[tournament].players: # Et je ne participe pas au tournoi ?
                response[tournament] = tournaments[tournament].name
        return JsonResponse(request, response)

class tournamentManagement(View):
    def get(self, request, id: int):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Connect yourself to fetch")
        global tournaments
        return JsonResponse(request, tournaments[id].toFront())


    def post(self, request, id: int):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified players can post tournaments')
        global tournaments
        data = request.data
        try:
            tournamentName = data['Name']
            nbPlayers = data['NumPlayers']
            admin = data['Admin']
            invited = data['Invited']
        except (KeyError, TypeError, ValueError) as e:
            return JsonBadRequest(request, {'Err': f'missing {e} to create tournament'})

        tournamentId = 0
        if len(tournaments) > 0:
            tournamentId = list(tournaments)[-1] + 1
        tournaments[tournamentId] = Tournament(tournamentName, nbPlayers, tournamentId, admin, invited)

        for i in invited:
            try:
                response = requests.post(
                    'http://hermes:8004/notif/tournament-request/' + str(request.user.id),
                    json={
                        'Tournament-Id': tournamentId,
                        'Tournament-Name': tournaments[tournamentId].name,
                        'Notified': i,
                    }
                )
                if response.status_code != 200:
                    return JsonErrResponse(request, {'Err': "Failed to send notification to invite friend"}, status = response.status_code)

            except Exception as e:
                return JsonErrResponse(request, {'Err': "Fatal: Failed to send notification to invite friend"}, status = response.status_code)

        return JsonResponse(request, {'Msg': "Tournament created"})

    def patch(self, request, id: int):
        if request.user.is_authenticated is False:
            return JsonUnauthorized(request, "Only authenticated players can patch a tournament")

        global tournaments
        data = request.data
        try:
            tournamentId = data['TournamentId']
            if request.user.id != tournaments[tournamentId].admin:
                return JsonUnauthorized(request, 'Only admin can patch ongoing tournaments')
            tournaments[tournamentId].name = data['NewName']
        except KeyError as e:
            return JsonBadRequest(request, f'missing key {e}')

        return JsonResponse(request, {'Msg': "Tournament name changed"})

class tournamentEntry(View):
    def delete(self, request):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can leave a tournament')

        global tournaments

        try:
            data = request.data
            playerId = data['PlayerId']
            tournamentId = data['TournamentId']
        except KeyError as e:
            return JsonBadRequest(request, f'missing key {e}')

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            str(tournamentId), {
                'type': 'LeaveTournament',
                'player': playerId,
            }
        )

        return JsonResponse(request, {"Ressource": "A player has left the tournament"})

    def post(self, request):
        global tournaments

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Connect yourself to join")
        playerId = request.user.id
        data = request.data

        try:
            TournamentId = data['TournamentId']
        except KeyError as e:
            return JsonBadRequest(request, f'Missing key {e}')

        try:
            TournamentId = int(TournamentId)
        except (ValueError, TypeError) as e:
            return JsonBadRequest(request, f'Request badly formated : id : {e}')

        if (TournamentId not in tournaments):
            return JsonNotFound(request, 'Tournament not found')

        try:
            tournaments[TournamentId].addPlayer(playerId)
            if playerId in tournaments[TournamentId].invited:
                tournaments[TournamentId].invited.remove(playerId)
        except Exception as e:
            return JsonErrResponse(request, {'Err': e.__str__()})


        return JsonResponse(request, {'Msg': "tournament joined", 'TournamentId': str(TournamentId)}) # url of the websocket to join

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

        tournaments[TournamentId].invited.append(data['Invited'])

        try:
            response = requests.post(
                'http://hermes:8004/notif/tournament-request/' + str(request.user.id),
                json={
                        'Tournament-Id': TournamentId,
                        'Tournament-Name': tournaments[TournamentId].name,
                        'Notified': data['Invited']
                    }
                )
            if response.status_code != 200:
                return JsonErrResponse(request, {'Err': "Failed to send notification to invite friend"}, status = response.status_code)

        except Exception as e:
            return JsonErrResponse(request, {'Err': "Fatal: Failed to send notification to invite friend"}, status = response.status_code)

        return JsonResponse({'Msg': "Friend has been invited"})

    def delete(self, request): # If someone declines invitation
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authenticated players decline tournament invitation')

        global tournaments
        if request['PlayerId'] not in tournaments[request['TournamentId']].invited:
            return JsonNotFound(request, "Player is not in the invited list of the tournament")
        tournaments[request['TournamentId']].invited.remove(request['PlayerId'])
        return JsonResponse({
            'Msg': 'Invitation declined',
            'PlayerId': request['PlayerId'],
            'TournamentId': request['TournamentId'],
        })

class myTournaments(View):
    def get(self, request):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "You need to be authenticated to see your tournaments")

        userId = request.user.id
        response = []

        for i in tournaments:
            if tournaments[i].userParticipating(userId) or userId == tournaments[i].admin:
                t = {}
                t['Name'] = tournaments[i].name
                t['Id'] = tournaments[i].id
                response.append(t)

        return JsonResponse(request, {'Ongoing': response})

class gameResult(View):
    def post(self, request): # Maybe send un tournamentState
        global tournaments

        if request.user.is_service is False:
            return JsonUnauthorized(request, 'Only services can add game to a tournament')

        data = request.data
        if 'tournamentId' not in data or 'game' not in data:
            return JsonBadRequest(request, {'Err': 'tournamentId or game not provided'})
        tournament = tournaments[data['tournamentId']]
        tournament.addGame(data['game'])

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            data['tournamentId'], {
                'type': 'LeaveTournament',
                'player': data['game']['Loser'],
            }
        )

        async_to_sync(channel_layer.group_send)(
            data['tournamentId'], {
                'type': 'tournamentState',
            }
        )

        if tournament.ongoingGames == 0:
            tournament.currentRound += 1

            # Check tournament end
            if tournament.NumPlayers == pow(2, tournament.currentRound): # NumPlayers == 2 puissance currentRound
                async_to_sync(channel_layer.group_send)(
                    data['tournamentId'], {
                        'Type': "TournamentEnd",
                    }
                )
                return JsonResponse(request, {'Msg': "Tournament ended"})

            tournament.ongoingGames = pow(2, tournament.nbPlayers) / pow(2, tournament.currentRound)

            async_to_sync(channel_layer.group_send)(
                data['tournamentId'], {
                    'type': 'StartRound',
                }
            )

        return JsonResponse(request, {'Msg': "Tournament game added"})

class startTournament(View):
    def post(self, request):
        if request.user.is_autenticated is False:
                return JsonUnauthorized(request, "You need to be authenticated to start a tournament")

        data = request.data
        userId = request.user.id
        try:
            tournamentId = data['TournamentId']
        except KeyError as e:
            return JsonBadRequest(request, f'Missing key {e}')

        if tournaments[tournamentId].admin != userId:
            return JsonUnauthorized(request, "You need to be admin of tournament to start it")

        if tournaments[tournamentId].nbPlayers != len(tournaments[tournamentId].players):
            return JsonErrResponse(request, "Not enough players to start the tournament")

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            tournamentId, {
                'type': 'StartGame',
            }
        )

        return JsonResponse(request, "Tournament started")

############## Debug ##############
def printData(data):
    print('Tournament id: ', data['tournamentId'])
    game = data['game']
    print('Winner is ', game['Winner'], ' with a score of ', game['Winner-score'])
    print('Loser is ', game['Loser'], ' with a score of ', game['Loser-score'])
