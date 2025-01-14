from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.views import View
from requests.models import DecodeError
from jwt import ExpiredSignatureError, InvalidTokenError
import requests
import bcrypt
import logging

from shared.validators import NickNameValidator
from signin.models import Client
from shared.jwt_management import JWT
from shared.utils import JsonNotFound, JsonResponseLogging as JsonResponse
from shared.utils import save_response, JsonErrResponse, JsonBadRequest, JsonForbidden, JsonConflict

def connection_response(request, jwt, refresh_token, content={}):
    response = JsonResponse(request, {'client': 'Connected'} | content)
    response.set_cookie('Auth', jwt, samesite='Strict', httponly=True)
    response.set_cookie('Ref', refresh_token, samesite='Strict', httponly=True, path='/petrus/auth/JWT-refresh/')
    return response

class signinView(View):
    """ se login """
    def post(self, request, string: str):
        data = request.data

        try:
            id = int(data['Id'])
            password = str(data['Pass'])
        except KeyError as e:
            return JsonBadRequest(request, f"no {str(e)} provided")
        except (ValueError, TypeError):
            return JsonBadRequest(request, f'{data['Id']} is not a valid id')

        try:
            client = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonNotFound(request, 'no user found for this id')

        if not bcrypt.checkpw(password.encode('utf-8'),
                          client.hashed_password.encode('utf-8')):
            return JsonForbidden(request, "invalid password")
        refresh_token = JWT.payloadToJwt(client.toDict(), JWT.privateKey)
        jwt = JWT.objectToAccessToken(client)

        response = connection_response(request, jwt, refresh_token)
        logging.info("Client connected")
        return response


class signupView(View):
    def post(self, request):
        data = request.data
        client = Client()
        try:
            client.email = str(data['Email'])
            client.nick = str(data['Nick'])
            client.password = str(data['Pass'])
            lang = str(data['Lang'])
            font = int(data['Font'])
        except KeyError as e:
            error_message = f"Key : {str(e)} not provided."
            logging.error(error_message)
            return JsonBadRequest(request, error_message)
        except (TypeError, ValueError):
            return JsonBadRequest(request, "Bad typing in body")

        try:
            client.check_password()
        except ValidationError as e:
            return JsonErrResponse(request, e.__str__(), status=422)
        client.hashed_password = bcrypt.hashpw(
            client.password.encode('utf-8'),
            bcrypt.gensalt()).decode('utf-8')

        try:
            NickNameValidator(client.nick)
            if (len(client.nick) > 16):
                raise ValidationError("nickname can't be longer than 16 chars")
        except ValidationError as e:
            return JsonBadRequest(request, str(e))

        response = save_response(request, client)
        if response.status_code != 200:
            return JsonConflict(request, "Error saving client")

        try:
            response = requests.post(
                f'http://alfred:8001/user/users/{client.id}/',
                json=client.to_alfred() | {'lang': lang, 'font': font})
            if response.status_code != 200:
                raise BaseException("Error : error during alfred row creation")
            response = requests.post(
                f'http://mnemosine:8008/memory/players/{client.id}/',
                json=client.to_mnemosine())
            if response.status_code != 200:
                raise BaseException("Error : error during mnemosine row creation")
        except BaseException as error:
            logging.error(f'{error} : during creation of ressources : {client}')
            try:
                requests.delete(f'http://alfred:8001/user/users/{client.id}/')
                requests.delete(f'http://mnemosine:8008/memory/players/{client.id}/')
            except BaseException as e:
                logging.error(f'error during deleting row. {e}')
            client.delete()
            return JsonConflict(request, str(error))

        refresh_token = JWT.objectToRefreshToken(client)
        jwt = JWT.objectToAccessToken(client)
        content = {"Client": client.id}
        response = connection_response(request, jwt, refresh_token, content=content)
        return response

class refreshView(View):
    def post(self, request):
        try:
            token = request.COOKIES['Ref']
            expired_token = request.COOKIES['Auth']
        except KeyError as e:
            return JsonBadRequest(request, f"Key : {str(e)} not provided.")
        try:
            decoded_token = JWT.jwtToPayload(token, JWT.publicKey)
            decoded_expired_token = JWT.jwtToPayloadNoExp(expired_token, JWT.publicKey)
        except (InvalidTokenError, ExpiredSignatureError, InvalidTokenError, TypeError, ValueError) as e:
            return JsonBadRequest(request, e.__str__())
        except DecodeError as e:
            return JsonConflict(request, e.__str__())

        try:
            id = int(decoded_token['id'])
            expired_id = int(decoded_expired_token['id'])
        except (KeyError, ValueError, TypeError):
            return JsonForbidden(request, "Ids not provided in tokens")

        if id != expired_id:
            return JsonForbidden(request, "Ids aren't the same")

        try:
            client = Client.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse(request, "Clients doesn't exist anymore", status=404)

        jwt = JWT.objectToAccessToken(client)
        response = JsonResponse(request, {"Token": "refreshed", "Client": request.user.id})
        response.set_cookie("Auth", jwt, samesite='Strict', httponly=True)
        return response

    def delete(self, request):
        response = JsonResponse(request, {"Token": "suppressed"})
        response.delete_cookie("Auth", samesite="Strict", path='/')
        response.delete_cookie('Ref', samesite="Strict", path='/petrus/auth/JWT-refresh/')
        return response
