from django.http.response import HttpResponse
from user_management.models import Client, FriendshipRequest, name_to_path

from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
import os
from django.conf import settings
from logging import warn

from shared.utils import JsonResponseLogging as JsonResponse
from shared.utils import JsonBadRequest, JsonErrResponse, JsonForbidden, JsonNotFound, delete_response, save_response, JsonUnauthorized

def int_to_lang(nb):
    if nb == "fr":
        return 1
    if nb == "en":
        return 2
    if nb == "zh":
        return 3
    warn("Bad format for language defaulting to en")
    return 2

class signinView(View):
    def get(self, request, string: str):
        Ava: bool = True
        id: int = -1
        nick: str = "unknown"
        by_mail = Client.get_by_email(string)
        by_nick = Client.get_by_nick(string)

        if by_mail is not None:
            Ava = False
            id = by_mail.id
            nick = by_mail.nick
        elif by_nick is not None:
            Ava = False
            id = by_nick.id
            nick = by_nick.nick
        return JsonResponse(request, {"Ava": Ava, "Id": id, "Nick": nick})


class userInfoView(View):
    def get(self, request, id: int):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Autentify yourself to fetch user info")
        if request.user.is_service is True or request.user.is_admin is True:
            try:
                return JsonResponse(request, Client.objects.get(id=id).personal_dict())
            except ObjectDoesNotExist:
                return JsonNotFound(request, "ressource not found")
        client = request.model
        if id == 0 or id == request.user.id:
            return JsonResponse(request, client.personal_dict())
        try:
            target = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonNotFound(request, "ressource not found")
        if client in target.friends.all():
            return JsonResponse(request, target.friends_dict())
        return JsonResponse(request, target.public_dict())

    def patch(self, request, id: int):
        if request.user.is_service is False and request.user.is_admin is False:
            client = request.model
        else:
            try:
                client = Client.objects.get(id=id)
            except ObjectDoesNotExist:
                return JsonNotFound(request, "Ressource doesn't exist")

        data = request.data
        lang = data.get("Lang")
        if lang is not None:
            client.lang = int_to_lang(lang)
        client.font = data.get("Font", client.font)
        client.nick = data.get("Nick", client.nick)
        client.email = data.get("Email", client.email)
        client.contrast_mode = data.get("Contrast-mode", client.contrast_mode)
        return save_response(request, client)


    def post(self, request, id: int):
        if request.user.is_service is not True:
            return JsonForbidden(request, "Only services can create a user")
        data = request.data
        client = Client()
        try:
            client.email = data['mail']
            client.nick = data['nick']
            client.id = data['id']
            client.lang = int_to_lang(data['lang'])
            client.font = data['font']
        except KeyError as e:
            return JsonBadRequest(request, f"Key : {str(e)} not provided.")
        return save_response(request, client)


    def delete(self, request, id: int):
        if request.user.is_service is not True or request.user.nick != "petrus":
            return JsonForbidden(request, "Only petrus can delete a user")
        try:
            to_delete = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonNotFound(request, "Ressource doesn't exist")

        return delete_response(request, to_delete)


class friendView(View):
    def get(self, request, id: int):
        if request.user.is_service is True or request.user.is_admin is True:
            try:
                requestee = Client.objects.get(id=id)
            except ObjectDoesNotExist as e:
                return JsonNotFound(request, e.__str__())

            if request.user.is_service is True:
                return JsonResponse(request, {
                        "Id": id,
                        "Friends": requestee.list_friends(),
                    })
            else:
                return JsonResponse(request, {
                        "Id": id,
                        "Nick": requestee.nick,
                        "Friends": requestee.list_friends(),
                        "Received": requestee.list_received_requests(),
                        "Sent": requestee.list_sent_requests(),
                    })

        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Autentify to fetch friend data')
        emiter = request.model
        return JsonResponse(request, {
            "Id": request.user.id,
            "Friends": emiter.list_friends(),
            "Requests": emiter.list_received_requests(),
            "Sent": emiter.list_sent_requests(),
        })

    def post(self, request, id: int):
        if request.user.is_autenticated is False:
            return JsonForbidden(request, "Only user can add FriendshipRequest for themself")
        sender = request.model
        if id == request.user.id:
            return JsonBadRequest(request, "invalid id")
        try:
            receiver = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse(request, "Ressource not found", status=404)
        return FriendshipRequest.processRequest(request, sender, receiver)

    def delete(self, request, id: int):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only user can suppress friend from friendlist')
        emiter = request.model
        try:
            target = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse(request, "ressource not found", status=404)
        return FriendshipRequest.deleteFriendship(request, emiter, target)


class avatarView(View):
    def get(self, request, id: int):
        try:
            client = Client.objects.get(id=id)
            url = name_to_path(self.avatar.url.split('/')[-1]) if self.avatar else None,
        except ObjectDoesNotExist:
            return JsonNotFound(request, 'no client for this id')
        return JsonResponse(request, {"url": url})

    def post(self, request, id: int):
        try:
            avatar = request.FILES['avatar']
        except KeyError as e:
            return JsonBadRequest(request, f"missing file : {e.__str__()}")
        client = request.model
        avatar.name = f'{client.nick}-{timezone.now().strftime("%Y%m%d%H%M%S")}'
        client.avatar = avatar
        return save_response(request, client)

def serve_avatar(request, filename):
    if request.method != 'GET':
        return JsonForbidden(request, 'Bad Method')
    file_path = os.path.join(settings.MEDIA_ROOT, 'avatars', filename)

    if request.user.is_autenticated is False:
        return JsonForbidden(request, 'Not authorised')

    try:
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type="image/png")
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
    except FileNotFoundError:
        return JsonNotFound(request, 'File not found.')
    except PermissionError:
        return JsonForbidden(request, 'no permission to access')
    except OSError as e:
        return JsonErrResponse(request, f'An error occurred: {e}', status=500)

