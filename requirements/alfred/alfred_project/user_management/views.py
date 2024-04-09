from user_management.models import Client, FriendshipRequest
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from shared.error_management import report_error


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
        email = data.get('mail', None)
        nickname = data.get('nick', None)
        unique_id = data.get('id', None)
        print(email, nickname, unique_id)
        if email is None:
            return JsonResponse({"Err": "email not filled"})
        if nickname is None:
            return JsonResponse({"Err": "nick not filled"})
        if unique_id is None:
            return JsonResponse({"Err": "field not filled"})
        try:
            Client.objects.create(
                unique_id=unique_id,
                email=email,
                nick=nickname
            )
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()})
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
                     "mail": object.email,
                     "avatar": object.avatar}
                    for object
                    in emiter
                    .friends
                    .all()
                ],
                "requests": [
                    {"id": object.sender.unique_id,
                     "nick": object.sender.nick,
                     "avatar": object.sender.avatar}
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
        client = Client.objects.get(unique_id=request.user.id)
        client.avatar = avatar
        client.save()
        return JsonResponse({})


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
