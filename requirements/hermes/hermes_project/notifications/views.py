from django.views import View
from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


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
