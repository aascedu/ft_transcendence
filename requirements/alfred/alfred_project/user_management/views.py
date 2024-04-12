from user_management.models import Client, FriendshipRequest
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse
from shared.error_management import report_error
from django.utils import timezone
import os


class userInfoView(View):
    def get(self, request, id: int) -> JsonResponse:
        try:
            client = Client.objects.get(unique_id=request.user.id)
        except BaseException as e:
            response = JsonResponse({"Err": e.__str__()})
            response.delete_cookie('aut')
            return response
        if id == 0 or id == request.user.id:
            return JsonResponse(client.personal_dict())
        try:
            target = Client.objects.get(unique_id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"Err", "invalid id"})
        if client in target.friends.all():
            return JsonResponse(target.friends_dict())
        return JsonResponse(target.public_dict())

    def patch(self, request, id: int) -> JsonResponse:
        try:
            client = Client.objects.get(unique_id=request.user.id)
        except BaseException as e:
            response = JsonResponse({"Err": e.__str__()})
            response.delete_cookie('aut')
            return response
        data = request.data
        client.avatar = data.get("Avatar", client.avatar)
        client.lang = data.get("Lang", client.lang)
        client.font = data.get("Font", client.font)
        client.nick = data.get("Nick", client.nick)
        client.email = data.get("Email", client.email)
        try:
            client.save()
        except BaseException as e:
            report_error(request, e.__str__())
            return JsonResponse({"Err", e.__str__()})
        return JsonResponse({"Client": "updated"})


    def post(self, request, id: int) -> JsonResponse:
        data = request.data
        client = Client()
        try:
            client.email = data['mail']
            client.nick = data['nick']
            client.unique_id = data['id']
        except KeyError as e:
            return JsonResponse({"Err": f"Key : {str(e)} not provided."}, status=400)
        try:
            client.save()
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()}, status=409)
        return JsonResponse({"Client": "created"})


    def delete(self, request, id: int) -> JsonResponse:
        try:
            client = Client.objects.get(unique_id=id)
        except BaseException:
            return JsonResponse({"Err": "invalid id"})
        try:
            client.delete()
        except BaseException:
            return JsonResponse({"Err": "internal database error"})
        return JsonResponse({"Client": "suppressed"})


class friendView(View):
    def get(self, request, id: int) -> JsonResponse:
        if id == 0:
            emiter = Client.objects.get(unique_id=request.user.id)
            return JsonResponse({
                "id": request.user.id,
                "friends": [
                    {"id": object.unique_id,
                     "nick": object.nick,
                     "mail": object.email}
                    for object
                    in emiter
                    .friends
                    .all()
                ],
                "requests": [
                    {"id": object.sender.unique_id,
                     "nick": object.sender.nick}
                    for object in list(
                        FriendshipRequest
                        .objects
                        .filter(receiver=emiter)
                    )
                ],
            })

        # view pour l'intra service
        # Securiser que seul les services peuvent faire

        try:
            requestee = Client.objects.get(unique_id=id)
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()})
        return JsonResponse({
                "Id": id,
                "Friends": [
                    object.unique_id
                    for object
                    in requestee
                    .friends
                    .all()
                ],
            })

    def post(self, request, id: int) -> JsonResponse:
        sender = Client.objects.get(unique_id=request.user.id)
        if id == request.user.id:
            return JsonResponse({"Err": "invalid id"})
        try:
            receiver = Client.objects.get(unique_id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"Err": "invalid id"})
        return FriendshipRequest.processRequest(receiver, sender)

    def delete(self, request, id: int) -> JsonResponse:
        emiter = Client.objects.get(unique_id=request.user.id)
        try:
            target = Client.objects.get(unique_id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"Err": "invalid id"})
        return FriendshipRequest.deleteFriendship(emiter, target)


class avatarView(View):
    def get(self, request, id: int):
        client = Client.objects.get(unique_id=id)
        return JsonResponse({f'avatar_url {id}': client.avatar.url})

    def post(self, request, id: int):
        try:
            avatar = request.FILES['avatar']
        except BaseException as e:
            return JsonResponse({"Err": f"missing file : {e.__str__()}"})
        try:
            client = Client.objects.get(unique_id=request.user.id)
        except BaseException as e:
            return JsonResponse({"Err": f"bad request user id {e.__str__()}"})
        avatar.name = f'{client.nick}-{timezone.now().strftime("%Y%m%d%H%M%S")}'
        client.avatar = avatar
        try:
            client.save()
        except BaseException as e:
            return JsonResponse({"Err": f"an error occured {e.__str__()}"})
        return JsonResponse({"Success": "avatar successfully updated"})

def serve_avatar(request, filename):
    if request.method != 'GET':
        return JsonResponse({"Err": "Bad Method"}, status=403)

    file_path = os.path.join(settings.MEDIA_ROOT, 'avatars', filename)

    if request.user.is_autenticated is False:
        return JsonResponse({"Err": "Not authorised"}, status=403)

    try:
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type="image/png")
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
    except FileNotFoundError:
        return JsonResponse({"Err": "File not found."}, status=404)
    except PermissionError:
        return JsonResponse({"Err": "no permission to access"}, status=403)
    except OSError as e:
        return JsonResponse({"Err": f"An error occurred: {e}"}, status=500)

@csrf_exempt
def createUser(request):
    nick = "arthur"
    request = request
    mail = "delafforest@gmail.com"
    client = Client.objects.create(nick=nick, email=mail)
    client.save()
    return JsonResponse({nick: mail})


@csrf_exempt
def view_db(request):
    request = request
    clients = [object.to_dict() for object in Client.objects.all()]
    return JsonResponse({"clients": list(clients)})
