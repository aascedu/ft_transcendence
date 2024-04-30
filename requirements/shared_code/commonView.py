from datetime import datetime
from django.views import View
from django.http import JsonResponse
import nanoid

identificators = {}

class socketConnectionView(View):
    global identificators
    def get(self, request):
        global identificators

        key = nanoid.generate()
        request.user.date = datetime.now()
        identificators |= {key: request.user}

        #if request.user.is_autenticated is False:
            #return JsonForbiden(request.user.error)

        return JsonResponse({"Bigrement": "bien", "Key": key})

    def checkWebSocketIdentificator(self, request):
        global identificators
        print(identificators[request.user.id])

        return JsonResponse({"delete": "delete"})

