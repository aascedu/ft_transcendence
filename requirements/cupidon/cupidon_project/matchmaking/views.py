from django.views import View
from shared.utils import JsonResponseLogging as JsonResponse, JsonUnauthorized, JsonBadRequest, JsonNotFound, JsonErrResponse, JsonConflict
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from matchmaking.Player import gameRequesters, waitingList
import requests
import logging

class RequestGame(View):
    def post(self, request):
        global gameRequesters

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can invite friends to play')

        data = request.data
        try:
            p1 = request.user.id
            p2 = int(data['PlayerToInvite'])
            strp1 = str(p1)
            strp2 = str(data['PlayerToInvite'])
        except (KeyError, TypeError, ValueError) as e:
            return JsonBadRequest(request, f'missing {e} to request game')

        try:
            response = requests.get(f'http://hermes:8004/notif/self-ava/{p1}/')
            if response.json().get('Ava', []) is False:
                return JsonConflict(request, 'you are not available')
        except BaseException:
            return JsonConflict(request, 'conflict with this request')

        if [p2, p1] in gameRequesters:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                strp2, {
                    'type': 'SendToGame',
                    'player1': p2,
                    'player2': p1,
                }
            )
            gameRequesters.remove([p2, p1])
            return JsonResponse(request, {'RoomName': strp2 + '-' + strp1})

        try:
            response = requests.get(f'http://hermes:8004/notif/self-ava/{p2}/')
            if response.json().get('Ava', []) is False or response.json().get('Ava', []) is None:
                return JsonConflict(request, 'opponent is not available')
        except BaseException:
            return JsonConflict(request, 'Failed to get opponent availability')

        try:
            response = requests.post(
                'http://hermes:8004/notif/game-request/' + strp1 + '/',
                json={
                    'Notified': p2,
                }
            )
            if response.status_code != 200:
                logging.warning("Failed to send invitation to player " + strp2)
                return JsonErrResponse(request, {'Err': "Failed to send notification to invite friend"}, status = response.status_code)
        except Exception:
            logging.error("Failed to send invitation to player " + strp2)
            return JsonErrResponse(request, {'Err': "Fatal: Failed to send notification to invite friend"}, status = response.status_code)
        gameRequesters.append([p1, p2])

        return JsonResponse(request, {'Msg': 'Invitation successfully sent'})

    def delete(self, request):
        global gameRequesters

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can cancel invitation')

        for i in gameRequesters:
            if request.user.id in i:
                gameRequesters.remove(i)
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    str(request.user.id), {
                        'type': 'Leave',
                        'isResponse': False,
                    }
                )
        try:
            requests.delete(
                'http://hermes:8004/notif/available-states/',
                json={'Id': request.user.id})
        except BaseException:
            pass

        return JsonResponse(request, {'Msg': 'Invitation successfully canceled'})

class RequestGameResponse(View):
    def post(self, request, requester: int, invited: int):
        global gameRequesters

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can accept an invitation')

        try:
            strRequester = str(requester)
            strinvited = str(invited)
        except BaseException:
            return JsonBadRequest(request, 'Invalid requester id')

        if [requester, invited] not in gameRequesters:
            return JsonBadRequest(request, 'No such game requested')

        try:
            r = requests.delete(
                'http://hermes:8004/notif/available-states/',
                json={'Id': invited})
            if r.status_code != 200:
                return JsonConflict(request, "Couldn't update available state")
        except Exception:
            return JsonConflict(request, "Couldn't update available state")
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            strRequester, {
                'type': 'SendToGame',
                'player1': requester,
                'player2': invited,
            }
        )
        gameRequesters.remove([requester, invited])

        return JsonResponse(request, {'RoomName': strRequester + '-' + strinvited})

    def delete(self, request, requester: int, invited: int):
        global gameRequesters

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can refuse an invitation')

        try:
            strRequester = str(requester)
        except BaseException:
            return JsonBadRequest(request, 'Invalid requester id')

        for i in gameRequesters:
            if request.user.id in i:
                gameRequesters.remove(i)
                channel_layer = get_channel_layer()

                async_to_sync(channel_layer.group_send)(
                    strRequester, {
                        'type': 'Leave',
                        'id': request.user.id,
                        'isResponse': True,
                    }
                )
            try:
                request = requests.post(
                    'http://hermes:8004/notif/available-states/',
                    json={'Id': requester})
                if request.status_code != 200:
                    logging.error("Player " + strRequester + " state update request has failed")
                    return JsonConflict(request, {'Err': "Player state update request has failed"})
            except Exception:
                logging.critical("Player " + strRequester + " state update request has critically failed")
                return JsonConflict(request, "Player state update request has failed")


        return JsonResponse(request, {'Msg': 'Invitation to game refused'})

class RestoreAvailability(View):
    def delete(self, request, requester: int):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can refuse an invitation')
        channel_layer = get_channel_layer()

        if requester not in waitingList:
            return JsonBadRequest(request, 'You are not currently looking for a match')

        async_to_sync(channel_layer.group_send)(
            'matchmakingRoom', {
                'type': 'Leave',
                'id': request.user.id,
                'isResponse': False,
            }
        )
        try:
            request = requests.post(
                'http://hermes:8004/notif/available-states/',
                json={'Id': requester})
        except Exception:
            pass

        return JsonResponse(request, {'Msg': 'Stopped looking for a game'})
