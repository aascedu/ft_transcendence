from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from shared.utils import JsonUnallowedMethod, JsonUnauthorized, JsonBadRequest

def notification_by_notified_id(function):
    def wrapper(request, requester: int):
        response, notification_content, error = function(request, requester)
        if request.method != 'POST':
            return JsonUnallowedMethod(request, "Only 'POST' method allowed to create notifications")
        if request.user.is_service is False:
            return JsonUnauthorized(request, error if error else 'Only service can notify client')
        try:
            notified = int(request.data['Notified'])
        except KeyError as e:
            return JsonBadRequest(request, str(e))
        except (ValueError, TypeError):
            return JsonBadRequest(request, 'Notified must be an id')
        notified_group = f'user_{notified}_group'
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
                notified_group,
                notification_content
        )
        return response
    return wrapper

def notification_global(function):
    def wrapper(request, requester: int):
        response, notification_content, error = function(request, requester)
        if request.method != 'POST':
            return JsonUnallowedMethod(request, "Only 'POST' method allowed to create notifications")
        if request.user.is_service is False:
            return JsonUnauthorized(request, error if error else 'Only service can notify client')
        notified_group = 'notification_group'
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
                notified_group,
                notification_content
        )
        return response
    return wrapper

