from django.views import View
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.views.generic.base import logging
from shared.utils import JsonBadRequest, JsonForbidden, JsonUnallowedMethod, JsonUnauthorized
from shared.utils import JsonResponseLogging as JsonResponse
from notifications.cache import get_cache, set_cache
from notifications.decorators import notification_by_notified_id, notification_global
import requests

# Create your views here.

class onlineView(View):
    def get(self, request):
        return_json = {}
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Friendship list can only be get if autenticated")
        id = request.user.id
        try:
            response = requests.get(f'http://alfred:8001/user/friends/{id}/')
            if response.status_code != 200:
                raise BaseException(f'Error during fetch: {response.json()['Err']}')
        except BaseException as e:
            return JsonResponse(request, {'Err': f'{e}'})

        friends = response.json().get('Friends', [])
        for friend in friends:
            try:
                id = int(friend['Id'])
            except (ValueError, TypeError) as e:
                return JsonBadRequest(request, f'friend id : {friend} must be an int : {e}')
            if get_cache(f'user_{id}') is None:
                return_json |= {id: False}
            else:
                return_json |= {id: True}
        return JsonResponse(request, {"online-status": return_json})


class availableFriendView(View):
    def get(self, request):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Available friend can only be fetch if autenticated')
        id = request.user.id
        try:
            response = requests.get(f'http://alfred:8001/user/friends/{id}/')
            if response.status_code != 200:
                raise BaseException(f'Error during fetch: {response.json()['Err']}')
        except BaseException as e:
            return JsonResponse(request, {'Err': f'{e}'})

        friends = response.json().get('Friends', [])
        array = []
        for friend in friends:
            if get_cache(f'ava_{id}') is True:
                array.append(friend)
        return JsonResponse(request, {'Ava': array})


    def post(self, request):
        if request.user.is_service is False:
            return JsonForbidden(request, 'Only service can modify availability')
        id = request.data['Id']
        set_cache(f'ava_{id}', True)
        return JsonResponse(request, {'Ava': True})

    def delete(self, request):
        if request.user.is_service is False:
            return JsonForbidden(request, 'Only service can modify availability')
        id = request.data['Id']
        set_cache(f'ava_{id}', False)
        return JsonResponse(request, {'Ava': False})

@notification_global
def global_notification(request, requester: int):
    response = JsonResponse(request, {'status': 'Notification sent'})
    data = request.data
    try:
        message = data['msg']
    except KeyError:
        message = 'generic message'
    content = {
        'type': 'notification.message',
        'message': message,
    }
    return response, content, None

@notification_by_notified_id
def friendship(request, requester: int):
    response = JsonResponse(request, {'Friendship': 'Notified'})
    content = {
            'type': 'notification.new.friendship',
            'requester': requester,
        }
    error = 'Only services can notify friendship'
    return response, content, error

@notification_by_notified_id
def friendshipRequest(request, requester: int):
    response = JsonResponse(request, {'Friendship': 'Notified'})
    content = {
            'type': 'notification.friendship.request',
            'requester': requester,
        }
    error = 'Only service can notify new friendship request'
    return response, content, error

@notification_by_notified_id
def gameRequest(request, requester : int):
    notified = request.data['Notified']
    content = {
            'type': 'notification.game.request',
            'player1': notified,
            'player2': requester,
        }
    response = JsonResponse(request, {'status': 'Game accepted'})
    return response, content, None

@notification_by_notified_id
def tournamentRequest(request, requester: int):
        try:
            notified = int(request.data['Notified'])
            tournament_name = request.data['Tournament-Name']
            tournament_id = int(request.data['Tournament-Id'])
        except KeyError as e:
            return JsonBadRequest(request, str(e))
        except (ValueError, TypeError):
            return JsonBadRequest(request, 'Notified must be an id')

        content = {
                'type': 'notification.tournament.request',
                'player1': notified,
                'player2': requester,
                'tournament-name': tournament_name,
                'tournament-id': tournament_id
            }
        response = JsonResponse(request, {'status': 'Tournament requested'})
        return response, content, None

