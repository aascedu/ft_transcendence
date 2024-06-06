from django.views import View
from django.shortcuts import render
from shared.utils import JsonResponseLogging as JsonResponse, JsonUnauthorized, JsonBadRequest, JsonNotFound, JsonErrResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
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
            return JsonBadRequest(request, {'Err': f'missing {e} to create tournament'})
        
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

        return JsonResponse(request, 'Invitation successfully sent')

class RequestGameResponse(View):
    def post(self, request, requester: int, invited: int):
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

        # Sauf si on fait a la main dans le front ?
        async_to_sync(channel_layer.group_send)(
            str(invited), {
                'type': 'SendToGame',
                'player1': requester,
                'player2': invited,
            }
        )
        # Mettre le mec unavailable pdt la recherche ?

    def delete(self, request, requester: int, invited: int):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only authentified player can accept an invitation')

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            str(requester), {
                'type': 'Leave',
            }
        )
        # Notif ?
