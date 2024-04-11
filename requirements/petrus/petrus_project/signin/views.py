from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpRequest, JsonResponse
from django.views import View
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
            return JsonResponse({"Err": e.__str__()})

        client.hashed_password = bcrypt.hashpw(
            client.password.encode('utf-8'),
            bcrypt.gensalt()).decode('utf-8')

        if Client.objects.filter(email=client.email).exists():
            return JsonResponse({"Err": "known email"}, status=409)
        if Client.objects.filter(nick=client.nick).exists():
            return JsonResponse({"Err": "nick unavalable"}, status=409)
        try:
            client.save()
        except IntegrityError as e:
            print("An integrity error occured:", e)
            return JsonResponse({"Err": e}, status=409)

# checker si les requests sont successfull
        response_alfred = requests.post(
            f'http://alfred:8001/user/users/{client.unique_id}',
            json=client.to_alfred())
        if response_alfred.status_code != 200:
            client.delete()
            return JsonResponse(response_alfred.json(), status_code=response_alfred.status_code)
# checker si les requests sont successfull
        response_petrus = requests.post(
            "http://mnemosine:8008/memory/players/0",
            json=client.to_mnemosine())

        if response_petrus.status_code != 200:
            client.delete()

        try:
            refresh_token = JWT.objectToRefreshToken(client)
            jwt = JWT.objectToAccessToken(client)
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()})
        response = JsonResponse({"ref": refresh_token})
        response.set_cookie("auth", jwt)
        return response


class refreshView(View):
    def get(self, request):
        data = request.data
        if 'ref' not in data:
            return JsonResponse({"Err": "no refresh_token provided key: Ref"})

        token = data['ref']
        try:
            decoded_token = JWT.jwtToPayload(token, JWT.publicKey)
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()})

        if 'id' not in decoded_token:
            return JsonResponse({"Err": "no id in data"})

        client = Client.objects.filter(unique_id=decoded_token['id'])
        if not client.exists():
            return JsonResponse({"Err": "invalid refresh_token"})

        try:
            jwt = JWT.objectToAccessToken(client.first())
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()})
        response = JsonResponse({})
        response.set_cookie("auth", jwt)
        return response
