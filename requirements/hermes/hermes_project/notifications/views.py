from django.views import View
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.views.generic.base import logging
from shared.utils import JsonBadRequest, JsonErrResponse, JsonForbidden, JsonUnallowedMethod, JsonUnauthorized
from shared.utils import JsonResponseLogging as JsonResponse
from notifications.cache import get_cache, set_cache
from notifications.decorators import notification_by_notified_id, notification_global, notification_to_friends
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
        updateAva(request, id)
        return JsonResponse(request, {'Ava': True})

    def delete(self, request):
        if request.user.is_service is False:
            return JsonForbidden(request, 'Only service can modify availability')
        id = request.data['Id']
        updateAva(request, id)
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
def friendshipRefused(request, requester: int):
    response = JsonResponse(request, {'Request': 'Suppressed'})
    content = {
            'type': 'notification.friendship.refused',
            'requester': requester,
        }
    error = 'Only service can notify new friendship request'
    return response, content, error

@notification_by_notified_id
def friendshipSuppressed(request, requester: int):
    response = JsonResponse(request, {'Suppression': 'Notified'})
    content = {
            'type': 'notification.friendship.suppressed',
            'requester': requester,
        }
    error = 'Only service can notify new friendship request'
    return response, content, error

@notification_by_notified_id
def gameRequest(request, requester : int):
    content = {
            'type': 'notification.game.request',
            'requester': requester,
        }
    response = JsonResponse(request, {'status': 'Game accepted'})
    return response, content, None

@notification_by_notified_id
def tournamentRequest(request, requester: int):
        try:
            tournament_name = request.data['Tournament-Name']
            tournament_id = int(request.data['Tournament-Id'])
        except KeyError as e:
            return JsonBadRequest(request, str(e)), None, None
        except (ValueError, TypeError):
            return JsonBadRequest(request, 'Notified must be an id'), None, None

        content = {
                'type': 'notification.tournament.request',
                'requester': requester,
                'tournament-name': tournament_name,
                'tournament-id': tournament_id
            }
        response = JsonResponse(request, {'status': 'Tournament requested'})
        return response, content, None

@notification_to_friends
def updateProfile(request, requester:int):
    response = JsonResponse(request, {'Login': 'Notified'})
    content = {
            'type': 'notification.profile.change',
            'requester': requester,
        }
    error = 'Only service can notify login change'
    return response, content, error

@notification_to_friends
def updateAva(request, requester:int):
    response = JsonResponse(request, {'Ava states': 'updated'})
    content = {
            'type': 'notification.update.state',
            'requester': requester,
        }
    error = 'Only service can notify login change'
    return response, content, error

