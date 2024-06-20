from datetime import datetime
from django.views import View
from django.http import JsonResponse
import nanoid

from shared.utils import JsonForbidden


identificators = {}

class socketConnectionView(View):
    global identificators
    def get(self, request):
        global identificators

        if request.user.is_autenticated is False:
            return JsonForbidden(request, request.user.error)

        key = nanoid.generate()
        request.user.date = datetime.now()
        identificators |= {key: request.user}

        return JsonResponse({"Key": key})

class healthcheckView(View):
    def get(self, request):
        return JsonResponse({"Service": "Up"})

