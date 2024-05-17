from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.http import HttpRequest, JsonResponse
from django.views import View
from requests.models import DecodeError
from jwt import ExpiredSignatureError, InvalidTokenError
import requests
import bcrypt

from signin.models import Client
from shared.jwt_management import JWT
from shared.utils import save_response, JsonErrResponse, JsonBadRequest, JsonForbiden


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
            id = by_mail.id
            nick = by_mail.nick
        elif by_nick is not None:
            Ava = False
            id = by_nick.id
            nick = by_nick.nick
        return JsonResponse({"Ava": Ava, "Id": id, "Nick": nick})

    def post(self, request, string: str) -> JsonResponse:
        data = request.data

        try:
            id = data['Id']
            password = data['Pass']
        except KeyError as e:
            return JsonBadRequest(f"no {str(e)} provided")

        try:
            id = int(id)
        except (ValueError, TypeError):
            return JsonBadRequest(f"{id} is not a valid id")

        try:
            client = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse("no user found for this id", status=404)

        if not bcrypt.checkpw(password.encode('utf-8'),
                          client.hashed_password.encode('utf-8')):
            return JsonForbiden("invalid password")
        refresh_token = JWT.payloadToJwt(client.toDict(), JWT.privateKey)
        jwt = JWT.objectToAccessToken(client)
        response = JsonResponse({"Client": "connected", "ref": refresh_token})
        response.set_cookie("auth", jwt, samesite='Lax', httponly=True)
        return response


class signupView(View):
    """ s'inscrire """
    def get(self, request):
        request = request
        return JsonResponse({"Ava": True})

    def post(self, request):
        data = request.data
        client = Client()
        try:
            client.email = data['Email']
            client.nick = data['Nick']
            client.password = data['Pass']
            lang = data['Lang']
            font = data['Font']
        except KeyError as e:
            return JsonBadRequest(f"Key : {str(e)} not provided.")

        try:
            client.check_password()
        except ValidationError as e:
            return JsonErrResponse(e.__str__(), status=422)
        client.hashed_password = bcrypt.hashpw(
            client.password.encode('utf-8'),
            bcrypt.gensalt()).decode('utf-8')

        response = save_response(client)
        if response.status_code != 200:
            return response

        try:
            response = requests.post(
                f'http://alfred:8001/user/users/{client.id}',
                json=client.to_alfred() | {'lang': lang, 'font': font})
            if response.status_code != 200:
                raise BaseException("Error : error during alfred row creation")
            response = requests.post(
                f'http://mnemosine:8008/memory/players/{client.id}',
                json=client.to_mnemosine())
            if response.status_code != 200:
                raise BaseException("Error : error during mnemosine row creation")
        except BaseException as e:
            client.delete()
            print(f'Error : {e} : during creation of ressources : {client}')
            try:
                requests.delete(f'http://alfred:8001/user/users/{client.id}')
                requests.delete(f'http://mnemosine:8008/memory/players/{client.id}')
            except BaseException as e:
                print(f'Error: during deleting row. {e}')
            return JsonErrResponse('Internal error', status=409)

        refresh_token = JWT.objectToRefreshToken(client)
        jwt = JWT.objectToAccessToken(client)
        response = JsonResponse({"Client": client.id, "ref": refresh_token})
        response.set_cookie("auth", jwt, samesite='Lax', httponly=True)
        return response


class refreshView(View):
    def post(self, request):
        try:
            token = request.data['ref']
            expired_token = request.COOKIES['auth']
        except KeyError as e:
            return JsonBadRequest(f"Key : {str(e)} not provided.")

        try:
            decoded_token = JWT.jwtToPayload(token, JWT.publicKey)
            decoded_expired_token = JWT.jwtToPayloadNoExp(expired_token, JWT.publicKey)
        except (InvalidTokenError, ExpiredSignatureError, InvalidTokenError) as e:
            return JsonForbiden(e.__str__())
        except DecodeError as e:
            return JsonErrResponse(e.__str__(), status=500)

        try:
            id = decoded_token['id']
            expired_id = decoded_expired_token['id']
        except KeyError:
            return JsonForbiden("Ids not provided in tokens")

        if id != expired_id:
            return JsonForbiden("Ids aren't the same")

        try:
            client = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse("Clients doesn't exist anymore", status=404)

        jwt = JWT.objectToAccessToken(client)
        response = JsonResponse({"Token": "refreshed"})
        response.set_cookie("auth", jwt, samesite='Lax', httponly=True)
        return response
