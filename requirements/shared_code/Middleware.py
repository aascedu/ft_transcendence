from django.db import Error
from django.http import HttpRequest, JsonResponse
from .jwt_management import JWT
from .common_classes import User
import json


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
        if 'auth' not in request.COOKIES:
            request.client = User(error="No JWT provided")
            print("JWT: request with no jwt")
            return None

        autorisationJWT = request.COOKIES['auth']

        try:
            decodedJWT = JWT.jwtToPayload(autorisationJWT, self.publicKey)
        except BaseException as e:
            request.client = User(error=e.__str__())
            print("JWT: Warning: ", e.__str__())
            return None

        request.client = User(nick=decodedJWT.get('nick'),
                            id=decodedJWT.get('id'),
                            is_autenticated=True)
        print("JWT: User:", str(User))
        return None


class ensureIdentificationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        key = public_key
        # key = os.environ.get('PUBLIC_KEY_JWT')
        if not key:
            raise Error("publicKey is not defined")
        self.publicKey = key

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        if not request.client.is_autenticated:
            return JsonResponse({"Err": request.client.error})
        return None


class RawJsonToDataGetMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        try:
            request.data = json.loads(request.body.decode('utf-8'))
        except BaseException as e:
            request.data = {"Err": e}
        return None
