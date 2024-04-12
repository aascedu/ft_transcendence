from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views import View
from jwt import ExpiredSignatureError, InvalidTokenError
from requests.models import DecodeError, Response
from shared.jwt_management import JWT
import requests
import bcrypt

from signin.models import Client


def view_db(request: HttpRequest) -> JsonResponse:
    request = request
    clients = [object.toDict() for object in Client.objects.all()]
    return JsonResponse({"clients": list(clients)})


class signinView(View):
    """ se login """

    def get(self, request, string: str):
        Ava: bool = True
        id: int = -1
        nick: str = "unknown"
        by_mail = Client.get_by_email(string)
        by_nick = Client.get_by_nick(string)

        if by_mail is not None:
            Ava = False
            id = by_mail.unique_id
            nick = by_mail.nick
        elif by_nick is not None:
            Ava = False
            id = by_nick.unique_id
            nick = by_nick.nick
        return JsonResponse({"Ava": Ava, "Id": id, "Nick": nick}, status=200)

    def post(self, request, string: str) -> JsonResponse:
        data = request.data
        id = data.get('Id', None)
        password = data.get('Pass', None)
        if id is None:
            return JsonResponse({"Err": "no id provided"})

        if password is None:
            return JsonResponse({"Err": "no password provided"})
        client = Client.objects.filter(unique_id=id).first()
        if client is None:
            return JsonResponse({"Err": "invalid id provided"})

        if not bcrypt.checkpw(password.encode('utf-8'),
                          client.hashed_password.encode('utf-8')):
            return JsonResponse({"Err": "invalid password"})
        response = JsonResponse({})
        try:
            refresh_token = JWT.payloadToJwt(client.toDict(), JWT.privateKey)
            jwt = JWT.objectToAccessToken(client)
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()})
        response.set_cookie("ref", refresh_token)
        response.set_cookie("auth", jwt)
        return response


class signupView(View):
    """ s'inscrire """
    def get(self, request):
        request = request
        return JsonResponse({"Ava": True})

    def post(self, request):
        data = request.data
        try:
            client = Client()
            client.email = data['Email']
            client.nick = data['Nick']
            client.password = data['Pass']
        except KeyError as e:
            return JsonResponse({"Err": f"Key : {str(e)} not provided."}, status=400)

        try:
            client.check_password()
        except ValidationError as e:
            return JsonResponse({"Err": e.__str__()}, status=422)

        client.hashed_password = bcrypt.hashpw(
            client.password.encode('utf-8'),
            bcrypt.gensalt()).decode('utf-8')

        try:
            client.save()
        except IntegrityError as e:
            print("An integrity error occured:", e)
            return JsonResponse({"Err": e}, status=409)

        response_alfred = requests.post(
            f'http://alfred:8001/user/users/{client.unique_id}',
            json=client.to_alfred())
        response_mnemosine: Response = requests.post(
            f"http://mnemosine:8008/memory/players/{client.unique_id}",
            json=client.to_mnemosine())

        if response_mnemosine.status_code != 200 or response_alfred.status_code != 200:
            client.delete()
            print("Error : during creation of ressources :", client.__str__())
            print("Mnemosine response : ", response_mnemosine)
            print("Alfred response : ", response_alfred)
            response_alfred = requests.delete(f'http://alfred:8001/user/users/{client.unique_id}')
            response_mnemosine = requests.delete(f'http://mnemosine:8008/memory/players/{client.unique_id}')
            return JsonResponse({"Err": "Internal error"}, status=409)

        try:
            refresh_token = JWT.objectToRefreshToken(client)
            jwt = JWT.objectToAccessToken(client)
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()}, status=500)
        response = JsonResponse({"Client": "created", "ref": refresh_token})
        response.set_cookie("auth", jwt)
        return response


class refreshView(View):
    def post(self, request):
        try:
            token = request.data['ref']
            expired_token = request.COOKIES['auth']
        except KeyError as e:
            return JsonResponse({"Err": f"Key : {str(e)} not provided."}, status=400)

        try:
            decoded_token = JWT.jwtToPayload(token, JWT.publicKey)
            decoded_expired_token = JWT.jwtToPayloadNoExp(expired_token, JWT.publicKey)
        except (InvalidTokenError, ExpiredSignatureError, InvalidTokenError) as e:
            return JsonResponse({"Err": e.__str__()}, status=403)
        except DecodeError as e:
            return JsonResponse({"Err": e.__str__()}, status=500)

        try:
            id = decoded_token['id']
            expired_id = decoded_expired_token['id']
        except BaseException:
            return JsonResponse({"Err": "Ids not provided in tokens"}, status=403)

        if id != expired_id:
            return JsonResponse({"Err": "Ids aren't the same"}, status=403)

        client = Client.objects.filter(unique_id=id)
        if not client.exists():
            return JsonResponse({"Err": "Clients doesn't exist"}, status=403)

        jwt = JWT.objectToAccessToken(client.first())
        response = JsonResponse({"Token": "refreshed"})
        response.set_cookie("auth", jwt)
        return response
