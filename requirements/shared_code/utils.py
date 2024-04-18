from django.db.models import ProtectedError
from django.db.models.lookups import In
from django.http import JsonResponse
from django.db import IntegrityError
from django.core.exceptions import ValidationError


def save_response(object_to_save):
    try:
        object_to_save.save()
        return JsonResponse({"Ressource": "updated"})
    except IntegrityError as e:
        return JsonResponse({"Err": e.__str__()}, status=409)
    except ValidationError as e:
        return JsonResponse({"Err": e.__str__()}, status=422)
    except BaseException as e:
        return JsonResponse({"Err": e.__str__()}, status=500)


def delete_response(object_to_delete):
    try:
        object_to_delete.delete()
        return JsonResponse({"Ressource": "deleted"})
    except ProtectedError as e:
        return JsonResponse({"Err": e.__str__()}, status=422)
    except IntegrityError as e:
        return JsonResponse({"Err": e.__str__()}, status=409)
    except BaseException as e:
        return JsonResponse({"Err": e.__str__()}, status=500)
