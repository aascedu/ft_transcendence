from user_management.models import Client, FriendshipRequest
from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
import os
from django.conf import settings

from shared.utils import JsonBadRequest, JsonErrResponse, JsonForbiden, JsonNotFound, save_response


class userInfoView(View):
    def get(self, request, id: int) -> JsonResponse:
        if request.user.is_service is True or request.user.is_admin is True:
            try:
                return JsonResponse(Client.objects.get(id=id).personal_dict())
            except ObjectDoesNotExist:
                return JsonNotFound("ressource not found")

        client = request.model
        if id == 0 or id == request.user.id:
            print("client :", client.personal_dict())
            return JsonResponse(client.personal_dict())
        try:
            target = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonNotFound("ressource not found")
        if client in target.friends.all():
            return JsonResponse(target.friends_dict())
        return JsonResponse(target.public_dict())



    def patch(self, request, id: int) -> JsonResponse:
        if request.user.is_service is False and request.user.is_admin is False:
            client = request.model
        else:
            try:
                client = Client.objects.get(id=id)
            except ObjectDoesNotExist:
                return JsonNotFound("Ressource doesn't exist")

        data = request.data
        client.lang = data.get("Lang", client.lang)
        client.font = data.get("Font", client.font)
        client.nick = data.get("Nick", client.nick)
        client.email = data.get("Email", client.email)
        client.contrast_mode = data.get("Contrast-mode", client.contrast_mode)
        return save_response(client)


    def post(self, request, id: int) -> JsonResponse:
        if request.user.is_service is not True:
            return JsonForbiden("Only services can create a user")
        data = request.data
        client = Client()
        try:
            client.email = data['mail']
            client.nick = data['nick']
            client.id = data['id']
        except KeyError as e:
            return JsonBadRequest(f"Key : {str(e)} not provided.")
        return save_response(client)


    def delete(self, request, id: int) -> JsonResponse:
        if request.user.is_service is not True or request.user.nick != "petrus":
            return JsonForbiden("Only petrus can delete a user")
        try:
            to_delete = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse("Ressource doesn't exist", status=404)

        return delete_response(to_delete)


class friendView(View):
    def get(self, request, id: int) -> JsonResponse:
        if request.user.is_service is True or request.user.is_admin is True:
            try:
                requestee = Client.objects.get(id=id)
            except ObjectDoesNotExist as e:
                return JsonErrResponse(e.__str__(), status=404)

            if request.user.is_service is True:
                return JsonResponse({
                        "Id": id,
                        "Friends": requestee.list_friends(),
                    })
            else:
                return JsonResponse({
                        "Id": id,
                        "Nick": requestee.nick,
                        "Friends": requestee.list_friends(),
                        "Received": requestee.list_received_requests(),
                        "Sent": requestee.list_sent_requests(),
                    })

        emiter = request.model
        return JsonResponse({
            "Id": request.user.id,
            "Friends": emiter.list_friends(),
            "Requests": emiter.list_received_requests(),
            "Sent": emiter.list_sent_requests(),
        })

    def post(self, request, id: int) -> JsonResponse:
        if request.user.is_autenticated is False:
            return JsonForbiden("Only user can add FriendshipRequest for themself")
        sender = request.model
        if id == request.user.id:
            return JsonBadRequest("invalid id")
        try:
            receiver = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse("Ressource not found", status=404)
        return FriendshipRequest.processRequest(receiver, sender)

    def delete(self, request, id: int) -> JsonResponse:
        emiter = request.model
        try:
            target = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse("ressource not found", status=404)
        return FriendshipRequest.deleteFriendship(emiter, target)


class avatarView(View):
    def get(self, request, id: int):
        try:
            client = Client.objects.get(id=id)
            url = client.avatar.url
        except ObjectDoesNotExist:
            return JsonErrResponse("ressource not found", status=404)
        return JsonResponse({id: url})

    def post(self, request, id: int):
        try:
            avatar = request.FILES['avatar']
        except KeyError as e:
            return JsonBadRequest(f"missing file : {e.__str__()}")
        client = request.model
        avatar.name = f'{client.nick}-{timezone.now().strftime("%Y%m%d%H%M%S")}'
        client.avatar = avatar
        return save_response(client)

def serve_avatar(request, filename):
    if request.method != 'GET':
        return JsonForbiden("Bad Method")

    file_path = os.path.join(settings.MEDIA_ROOT, 'avatars', filename)

    if request.user.is_autenticated is False:
        return JsonForbiden("Not authorised")

    try:
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type="image/png")
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
    except FileNotFoundError:
        return JsonErrResponse("File not found.", status=404)
    except PermissionError:
        return JsonForbiden("no permission to access")
    except OSError as e:
        return JsonErrResponse(f"An error occurred: {e}", status=500)


def view_db(request):
    request = request
    clients = [object.to_dict() for object in Client.objects.all()]
    return JsonResponse({"clients": list(clients)})
