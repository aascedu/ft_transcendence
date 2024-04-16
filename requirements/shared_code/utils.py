from django.http import JsonResponse
from django.db import IntegrityError
from django.core.exceptions import ValidationError


def save_response(object_to_save):
    try:
        object_to_save.save()
    except IntegrityError as e:
        return JsonResponse({"Err", e.__str__()}, status=409)
    except ValidationError as e:
        return JsonResponse({"Err", e.__str__()}, status=422)
    except BaseException as e:
        return JsonResponse({"Err", e.__str__()}, status=500)
    return JsonResponse({"Client": "updated"})
