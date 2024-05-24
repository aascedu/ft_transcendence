from django.views import View
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from shared.utils import JsonBadRequest, JsonForbidden, JsonUnauthorized
from shared.utils import JsonResponseLogging as JsonResponse
from notifications.cache import get_cache
import requests

# Create your views here.

class onlineView(View):
    def get(self, request):
        return_json = {}
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Friendship list can only be get if autenticated")
        id = request.user.id
        try:
            response = requests.get(f'http://alfred:8001/user/friends/{id}')
            if response.status_code != 200:
                raise BaseException(f'Error during fetch: {response.json()['Err']}')
        except BaseException as e:
            return JsonResponse(request, {'Err': f'{e}'})

        friends = response.json().get("Friends")
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


class notificationsView(View):
    def get(self, request):
        if request.user.is_service is False:
            return JsonForbidden("Only services can notify")
        message = "notification_message"
        channel_layer = get_channel_layer()
        print(channel_layer)
        print("going to group send")
        async_to_sync(channel_layer.group_send)(
            "notification_group",
            {
                "type": "notification.message",
                "message": message,
            }
        )
        return JsonResponse(request, {"status": "Notification sent"})

class friendshipView(View):
    def post(self, request, requester: int):
        if request.user.is_service is False:
            return JsonUnauthorized(request, "Only services can notify new friendship")

        try:
            notified = int(request.data['Notified'])
        except KeyError as e:
            return JsonBadRequest(request, str(e))
        except (ValueError, TypeError):
            return JsonBadRequest(request, "Notified must be an id")

        channel_layer = get_channel_layer()

        notified_group = f'user_{notified}_group'
        print("notifying this group ", notified_group)
        async_to_sync(channel_layer.group_send)(
            notified_group,
            {
                'type': 'notification.new.friendship',
                'message': f'friendship: {requester}'
            }
        )
        return JsonResponse(request, {"Friendship": "Notified"})

class friendshipRequestView(View):
    def post(self, request, requester: int):
        if request.user.is_service is False:
            return JsonUnauthorized(request, "Only service can notify new friendship")

        try:
            notified = int(request.data['Notified'])
        except KeyError as e:
            return JsonBadRequest(request, str(e))
        except (ValueError, TypeError):
            return JsonBadRequest(request, "Notified must be an id")

        channel_layer = get_channel_layer()

        notified_group = f'user_{notified}_group'
        async_to_sync(channel_layer.group_send)(
            notified_group,
            {
                'type': 'notification.new.friendship',
                'message': f'friendship-request: {requester}'
            }
        )
        return JsonResponse(request, {"Friendship": "Notified"})

class gameRequestView(View): # Check ca !
    def get(self, request, requester: int):
        if request.user.is_service is False:
            return JsonUnauthorized(request, "Only service can notify new friendship")

        try:
            notified = int(request.data['Notified'])
        except KeyError as e:
            return JsonBadRequest(request, str(e))
        except (ValueError, TypeError):
            return JsonBadRequest(request, "Notified must be an id")

        notified_group = f'user_{notified}_group'

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            notified_group,
                {
                    'type': 'notification.game.request',
                    'notified': notified,
                    'message': f'game-request: {requester}'
                }
        )
        return JsonResponse(request, {"status": "Game requested"})

    def post(self, request, requester: int):
        if request.user.is_service is False:
            return JsonUnauthorized(request, "Only service can notify new friendship")

        try:
            notified = int(request.data['Notified'])
        except KeyError as e:
            return JsonBadRequest(request, str(e))
        except (ValueError, TypeError):
            return JsonBadRequest(request, "Notified must be an id")

        notified_group = f'user_{notified}_group'

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            notified_group,
                {
                    'type': 'notification.game.accepted',
                    'player1': notified,
                    'player2': requester,
                }
        )
        return JsonResponse(request, {"status": "Game accepted"})

class tournamentRequestView(View):
    def post(self, request, requester: int, tournament_id: int):
        if request.user.is_service is False:
            return JsonUnauthorized(request, "Only service can notify new friendship")

        try:
            notified = int(request.data['Notified'])
            tournament_name = request.data['Tournament-Name']
        except KeyError as e:
            return JsonBadRequest(request, str(e))
        except (ValueError, TypeError):
            return JsonBadRequest(request, "Notified must be an id")
        notified_group = f'user_{notified}_group'

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            notified_group, {
                    'type': 'notification.tournament.request',
                    'player1': notified,
                    'player2': requester,
                    'tournament-name': tournament_name,
                    'tournament-id': tournament_id
                }
        )
        return JsonResponse(request, {"status": "Tournament accepted"})

