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
    return JsonResponseLogging(request, {"Ressource": "updated"})

def delete_response(request, object_to_delete):
    try:
        object_to_delete.delete()
    except ProtectedError as e:
        return JsonResponseLogging(request, {"Err": e.__str__()}, status=422)
    except IntegrityError as e:
        return JsonResponseLogging(request, {"Err": e.__str__()}, status=409)
    return JsonResponseLogging(request, {"Ressource": "deleted"})

def JsonErrResponse(error_message, status):
    return JsonResponseLogging({"Err": error_message}, status)

def JsonUnauthorized(error_message):
    return JsonErrResponse("Unauthorized : " + error_message, status=401)

def JsonBadRequest(error_message):
    return JsonErrResponse("Bad Request : " + error_message, status=400)

def JsonForbiden(error_message):
    return JsonErrResponse("Forbiden : " + error_message, status=403)

def JsonNotFound(error_message):
    return JsonErrResponse("Ressource not found : " + error_message, status=404)

def JsonConflict(error_message):
    return JsonErrResponse("Conflict : " + error_message, status=409)
