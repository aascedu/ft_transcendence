from json.decoder import JSONDecodeError
from django.core.exceptions import ObjectDoesNotExist
from django.db import Error
from django.http import HttpRequest, JsonResponse
from shared.utils import JsonNotFound
from .jwt_management import JWT
from .common_classes import User
from shared.commonView import identificators
import json
import information
from shared.logging_django import log_info


from urllib.parse import parse_qs

class socketJWTIdentificationMiddleware:
    def __init__(self, application) -> None:
        self.application = application

    async def __call__(self, scope, receive, send):
        global identificators

        try:
            query_params = parse_qs(scope["query_string"].decode())
        except ValueError:
            scope['error'] = "Query_string is badly formated"
            return await self.application(scope, receive, send)

        if "token" not in query_params:
            scope["error"] = "No key in params"
            return await self.application(scope, receive, send)

        if query_params["token"][0] not in identificators:
            scope["error"] = "Invalid key"
            return await self.application(scope, receive, send)

        scope["user"]=identificators[query_params["token"][0]]
        del identificators[query_params["token"][0]]
        return await self.application(scope, receive, send)


class JWTIdentificationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        key = JWT.publicKey
        if not key:
            raise Error("publicKey is not defined")
        self.publicKey = key

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        if 'X-External-Request' not in request.headers:
            request.user = User.header_to_user(request.headers)
            return None
        if 'Auth' not in request.COOKIES:
            request.user = User(error="No JWT provided")
            return None
        autorisationJWT = request.COOKIES['Auth']
        try:
            decodedJWT = JWT.jwtToPayload(autorisationJWT, self.publicKey)
        except BaseException as e:
            request.user = User(error=e.__str__())
            return None
        request.user = User(nick=decodedJWT.get('nick'),
                            id=decodedJWT.get('id'),
                            is_autenticated=True)
        if "MAIN_MODEL" in information.__dict__:
            try:
                request.model = information.MAIN_MODEL.objects.get(id=request.user.id)
            except ObjectDoesNotExist as e:
                response = JsonNotFound(request, {"Err": f"Ressource doesn't exist anymore : {e.__str__()}"})
                return response
        return None

class RawJsonToDataGetMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        request.data = {}
        try:
            request.data = json.loads(request.body.decode('utf-8'))
        except (JSONDecodeError, UnicodeDecodeError):
            request.Error_Data = "Warn body couldn't be read : ignore if body is supposed to be empty"
        return None


class LoggingRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        log_info(request, response)
        return response
