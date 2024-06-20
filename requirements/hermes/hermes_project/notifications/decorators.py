from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from shared.utils import JsonUnallowedMethod, JsonUnauthorized, JsonBadRequest, JsonErrResponse
import requests
import logging

def notification_by_notified_id(function):
    def wrapper(request, requester: int):
        response, notification_content, error = function(request, requester)
        if request.method != 'POST':
            return JsonUnallowedMethod(request, "Only 'POST' method allowed to create notifications")
        if request.user.is_service is False:
            return JsonUnauthorized(request, error if error else 'Only service can notify client')
        if response.status_code != 200:
            return response
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

def notification_to_friends(function):
    def wrapper(request, requester: int):
        response, notification_content, error = function(request, requester)
        if request.user.is_service is False:
            return JsonUnauthorized(request, error if error else 'Only service can notify client')
        if response.status_code != 200:
            return response
        try:
            request = requests.get(f'http://alfred:8001/user/friends/{requester}/')
            notified = request.json().get("Friends")
        except BaseException:
            logging.warn("Friends couldn't be fetch from alfred")
            return JsonErrResponse(request, "Couldn't fetch from alfred", status=500)
        channel_layer = get_channel_layer()
        for notified_one in [each['Id'] for each in notified]:
            notified_group = f'user_{notified_one}_group'
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

