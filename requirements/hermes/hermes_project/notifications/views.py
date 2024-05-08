from django.views import View
from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from shared.utils import JsonBadRequest, JsonUnauthorized


# Create your views here.

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
            return JsonBadRequest("Notified must be an array of id")

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

