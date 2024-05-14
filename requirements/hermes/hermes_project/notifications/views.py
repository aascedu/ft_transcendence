from django.views import View
from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from shared.utils import JsonBadRequest
from notifications.cache import get_cache

# Create your views here.

class onlineView(View):
    def get(self, request):
        return_json = {}
        queryparams = request.GET

        clients = queryparams.getlist('status')
        for client in clients:
            try:
                id = int(client)
            except (ValueError, TypeError) as e:
                return JsonBadRequest(f'client id : {client} must be an int : {e}')
            if get_cache(f'user_{id}') is None:
                return_json |= {id: True}
            else:
                return_json |= {id: False}
        return JsonResponse({"online-status": return_json})


class notificationsView(View):
    def get(self, request):
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
        return JsonResponse({"status": "Notification sent"})

class friendshipView(View):
    def post(self, request, requester: int):
        if request.user.is_service is False:
            return JsonUnauthorized("Only service can notify new friendship")

        try:
            notified = int(request.data['Notified'])
        except KeyError as e:
            return JsonBadRequest(str(e))
        except (ValueError, TypeError):
            return JsonBadRequest("Notified must be an id")

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
        return JsonResponse({"Friendship": "Notified"})

class friendshipRequestView(View):
    def post(self, request, requester: int):
        if request.user.is_service is False:
            return JsonUnauthorized("Only service can notify new friendship")

        try:
            notified = int(request.data['Notified'])
        except KeyError as e:
            return JsonBadRequest(str(e))
        except (ValueError, TypeError):
            return JsonBadRequest("Notified must be an id")

        channel_layer = get_channel_layer()

        notified_group = f'user_{notified}_group'
        async_to_sync(channel_layer.group_send)(
            notified_group,
            {
                'type': 'notification.new.friendship',
                'message': f'friendship-request: {requester}'
            }
        )
        return JsonResponse({"Friendship": "Notified"})
