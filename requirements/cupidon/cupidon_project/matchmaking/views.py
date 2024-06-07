from django.views import View
from django.shortcuts import render
from shared.utils import JsonResponseLogging as JsonResponse, JsonUnauthorized, JsonBadRequest, JsonNotFound, JsonErrResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from matchmaking.Players import gameRequesters
import requests
import logging

class RequestGame(View):
    def post(self, request):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can invite friends to play')

        data = request.data
        try:
            p1 = request.user.id
            p2 = data['PlayerToInvite']
        except (KeyError, TypeError, ValueError) as e:
            return JsonBadRequest(request, f'missing {e} to request game')
        
        try:
            response = requests.post(
                'http://hermes:8004/notif/game-request/' + str(p1) + '/',
                json={
                    'Notified': p2,
                }
            )
            if response.status_code != 200:
                logging.warning("Failed to send invitation to player " + str(p2))
                return JsonErrResponse(request, {'Err': "Failed to send notification to invite friend"}, status = response.status_code)
        except Exception as e:
            logging.error("Failed to send invitation to player " + str(p2))
            return JsonErrResponse(request, {'Err': "Fatal: Failed to send notification to invite friend"}, status = response.status_code)

        return JsonResponse(request, {'Msg': 'Invitation successfully sent'})

    def delete(self, request):
        global gameRequesters

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can cancel invitation')

        # Check if the room exists ?
        for i in gameRequesters:
            if request.user.id in i:
                gameRequesters.remove(i)
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    request.user.id, {
                        'type': 'Leave',
                    }
                )

        return JsonResponse(request, {'Msg': 'Invitation successfully canceled'})    

class RequestGameResponse(View):
    def post(self, request, requester: int, invited: int):
        global gameRequesters

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can accept an invitation')
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            str(requester), {
                'type': 'SendToGame',
                'player1': requester,
                'player2': invited,
            }
        )
        gameRequesters.remove([requester, invited])

        # Mettre le mec unavailable pdt la recherche ?

        return JsonResponse(request, {'RoomName': str(requester) + '-' + str(invited),})

    def delete(self, request, requester: int, invited: int):
        global gameRequesters

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can refuse an invitation')

        for i in gameRequesters:
            if request.user.id in i:
                gameRequesters.remove(i)
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    str(requester), {
                        'type': 'Leave',
                    }
                )
            # Notif ?

        return JsonResponse(request, {'Msg': 'Invitation to game refused'})
