from django.views import View
from tournament.Tournament import Tournament, tournaments
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from shared.utils import JsonResponseLogging as JsonResponse, JsonUnauthorized, JsonBadRequest, JsonNotFound, JsonErrResponse
import requests
import logging

def updateTournament(tournamentId, isJoining, id):
    channel_layer = get_channel_layer()

    try:
        roomName = str(tournamentId)
    except:
        return
    async_to_sync(channel_layer.group_send)(
        roomName, {
            'type': 'TournamentState',
            'opt': isJoining,
            'id': id
        }
    )

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
            nbPlayers = int(data['NumPlayers'])
            admin = int(data['Admin'])
            invited = data['Invited']
        except (KeyError, TypeError, ValueError) as e:
            return JsonBadRequest(request, f'missing {e} to create tournament')

        tournamentId = 0
        if len(tournaments) > 0:
            tournamentId = list(tournaments)[-1] + 1
        tournaments[tournamentId] = Tournament(tournamentName, nbPlayers, tournamentId, admin, invited)

        for i in invited:
            try:
                response = requests.post(
                    'http://hermes:8004/notif/tournament-request/' + str(request.user.id) + '/',
                    json={
                        'Tournament-Id': tournamentId,
                        'Tournament-Name': tournaments[tournamentId].name,
                        'Notified': i,
                    }
                )
                if response.status_code != 200:
                    logging.warning("Failed to send invitation to player " + str(invited))
                    return JsonErrResponse(request, {'Err': "Failed to send notification to invite friend"}, status = response.status_code)
            except Exception as e:
                logging.error("Failed to send invitation to player " + str(invited))
                return JsonErrResponse(request, {'Err': "Fatal: Failed to send notification to invite friend"}, status = response.status_code)

        return JsonResponse(request, {'Msg': "Tournament created"})

    def patch(self, request, id: int):
        global tournaments

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Only authenticated players can patch a tournament")

        data = request.data
        try:
            tournamentId = int(data['TournamentId'])
            if request.user.id != tournaments[tournamentId].admin:
                return JsonUnauthorized(request, 'Only admin can patch ongoing tournaments')
            tournaments[tournamentId].name = data['NewName']
        except (KeyError, ValueError, TypeError) as e:
            return JsonBadRequest(request, f'missing key {e}')

        updateTournament(tournamentId, False, request.user.id)

        logging.info("Tournament " + str(tournamentId) + " has been renamed " + data['NewName'])
        return JsonResponse(request, {'Msg': "Tournament name changed"})

class tournamentEntry(View):
    def delete(self, request, tournamentId: int, playerId: int):
        global tournaments

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can leave a tournament')
        
        if playerId in tournaments[tournamentId].players:
            tournaments[tournamentId].players.remove(playerId)
            for dict in tournaments[tournamentId].aliases:
                if dict['Id'] == playerId:
                    tournaments[tournamentId].aliases.remove(dict)

        try:
            r = requests.post(
                'http://hermes:8004/notif/available-states/',
                json={'Id': request.user.id})
            if r.status_code != 200:
                return JsonErrResponse({'Err': "Couldn't update available state"})
        except Exception as e:
            return JsonErrResponse({'Err': e.__str__()})

        updateTournament(tournamentId, False, request.user.id)
        logging.info("Player " + str(playerId) + " has left tournament " + str(tournamentId))
        return JsonResponse(request, {"Ressource": "A player has left the tournament"})

    def post(self, request, tournamentId: int, playerId: int):
        global tournaments

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Connect yourself to join")
        userId = request.user.id

        try:
            tournamentId = int(tournamentId)
            data = request.data
            playerAlias = data['Alias']
        except (ValueError, TypeError) as e:
            return JsonBadRequest(request, f'Request badly formated : id : {e}')

        if (tournamentId not in tournaments):
            return JsonNotFound(request, 'Tournament not found')
        
        for i in tournaments:
            if tournaments[i].userParticipating(userId):
                return JsonBadRequest(request, "Already in tournament")

        try:
            tournaments[tournamentId].addPlayer(userId, playerAlias)
        except Exception as e:
            return JsonBadRequest(request, e.__str__())

        updateTournament(tournamentId, True, userId)
        logging.info("Player " + str(userId) + " has joined tournament " + str(tournamentId))

        # Check if we need to start tournament
        if len(tournaments[tournamentId].players) == tournaments[tournamentId].nbPlayers:
            tournaments[tournamentId].started = True
            tournaments[tournamentId].contenders = tournaments[tournamentId].players.copy()
            channel_layer = get_channel_layer()
            try:
                roomName = str(tournamentId)
                async_to_sync(channel_layer.group_send)(
                    roomName, {
                        'type': 'StartGame',
                    }
                )
                logging.info("Starting tournament")
            except:
                return JsonBadRequest(request, "Couldn't start tournament because of invalid tournament id")

        try:
            r = requests.delete(
                'http://hermes:8004/notif/available-states/',
                json={'Id': userId})
            if r.status_code != 200:
                return JsonErrResponse({'Err': "Couldn't update available state"})
        except Exception as e:
            return JsonErrResponse({'Err': e.__str__()})

        return JsonResponse(request, {'Msg': "tournament joined", 'TournamentId': str(tournamentId)}) # url of the websocket to join

class inviteFriend(View):
    def post(self, request, tournamentId: int):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can invite friends')

        global tournaments
        data = request.data

        try:
            invited = data['Invited']
        except KeyError as e:
            return JsonBadRequest(request, f'missing key {e}')
        try:
            invited = int(invited)
            if tournamentId not in tournaments:
                return JsonNotFound(request, 'tournament does not exists')
        except (TypeError, ValueError) as e:
            return JsonBadRequest(request, f'bad content {e}')


        tournaments[tournamentId].invited.append(invited)

        try:
            response = requests.post(
                'http://hermes:8004/notif/tournament-request/' + str(request.user.id) + '/',
                json={
                        'Tournament-Id': tournamentId,
                        'Tournament-Name': tournaments[tournamentId].name,
                        'Notified': invited
                    }
                )
            if response.status_code != 200:
                logging.warning("Failed to send invitation to player " + str(invited))
                return JsonErrResponse(request, {'Err': "Failed to send notification to invite friend"}, status = response.status_code)

        except Exception as e:
            logging.error("Failed to send invitation to player " + str(invited))
            return JsonErrResponse(request, {'Err': "Fatal: Failed to send notification to invite friend"}, status = response.status_code)

        updateTournament(tournamentId, False, request.user.id)
        logging.info("Player " + str(invited) + " has been invited to tournament " + str(tournamentId))
        return JsonResponse(request, {'Msg': "Friend has been invited"})

    def delete(self, request, tournamentId: int): # If someone declines invitation
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authenticated players decline tournament invitation')

        global tournaments

        try:
            strid = str(request.user.id)
            if strid not in tournaments[tournamentId].invited:
                return JsonNotFound(request, "Player is not in the invited list of the tournament")
            tournaments[tournamentId].invited.remove(strid)
        except:
            return JsonBadRequest(request, 'Invalid user id')

        updateTournament(tournamentId, False, request.user.id)
        return JsonResponse(request, {
            'Msg': 'Invitation declined',
        })

class myTournaments(View):
    def get(self, request):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "You need to be authenticated to see your tournaments")

        userId = request.user.id
        response = []

        for id in tournaments:
            if tournaments[id].userParticipating(userId) or userId == tournaments[id].admin:
                t = {}
                t['Name'] = tournaments[id].name
                t['Id'] = tournaments[id].id
                response.append(t)

        return JsonResponse(request, {'Ongoing': response})

class gameResult(View):
    def post(self, request): # Maybe send un tournamentState
        global tournaments

        if request.user.is_service is False:
            return JsonUnauthorized(request, 'Only services can add game to a tournament')

        data = request.data
        if 'tournamentId' not in data or 'game' not in data:
            return JsonBadRequest(request, 'tournamentId or game not provided')
        tournamentId = data['tournamentId']
        tournaments[tournamentId].addGame(data['game'])

        if tournaments[tournamentId].ended is False:
            updateTournament(tournamentId, False, request.user.id)
        return JsonResponse(request, {'Msg': "Tournament game added"})
