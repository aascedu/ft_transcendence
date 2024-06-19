from django.db.models import ProtectedError
from django.http import JsonResponse
from django.db import IntegrityError
from django.core.exceptions import ValidationError

def JsonResponseLogging(request, json, status=200):
    return JsonResponse(json, status=status)

def save_response(request, object_to_save):
    try:
        object_to_save.full_clean()
    except ValidationError as e:
        return JsonResponseLogging(request, {"Err": e.__str__()}, status=422)
    try:
        object_to_save.save()
    except IntegrityError as e:
        return JsonResponseLogging(request, {"Err": e.__str__()}, status=409)
    return JsonResponseLogging(request, object_to_save.to_dict())

def delete_response(request, object_to_delete):
    try:
        object_to_delete.delete()
    except ProtectedError as e:
        return JsonResponseLogging(request, {"Err": e.__str__()}, status=422)
    except IntegrityError as e:
        return JsonResponseLogging(request, {"Err": e.__str__()}, status=409)
    return JsonResponseLogging(request, {"Ressource": "deleted"})

def JsonErrResponse(request, error_message, status):
    return JsonResponseLogging(request, {"Err": error_message}, status)

def JsonUnauthorized(request, error_message):
    return JsonErrResponse(request, "Unauthorized : " + error_message, status=401)

def JsonBadRequest(request, error_message):
    return JsonErrResponse(request, "Bad Request : " + error_message, status=400)

def JsonForbidden(request, error_message):
    return JsonErrResponse(request, "Forbidden : " + error_message, status=403)

def JsonNotFound(request, error_message):
    return JsonErrResponse(request, "Ressource not found : " + error_message, status=404)

def JsonUnallowedMethod(request, error_message):
    return JsonErrResponse(request, "Method not allowd : " + error_message, status=405)

def JsonConflict(request, error_message):
    return JsonErrResponse(request, "Conflict : " + error_message, status=409)
