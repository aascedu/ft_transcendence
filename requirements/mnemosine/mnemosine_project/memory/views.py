from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db.models import Q
from django.views import View

from memory.models import Tournament, Game, Player
from shared.utils import JsonResponseLogging as JsonResponse
from shared.utils import JsonNotFound, JsonUnauthorized, delete_response, save_response, JsonBadRequest, JsonErrResponse, JsonForbidden

class tournamentHistoryView(View):
    def get(self, request, id: int):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Connect yourself to fetch this data')
        
        try:
            player = Player.objects.get(id=id)
        except ObjectDoesNotExist:
            JsonNotFound(request, 'Id is not found in db')
        return_json = {player.id: [tournament.to_dict() for tournament in player.tournaments.all()]}

        return JsonResponse(request, return_json)

class tournamentView(View):
    def get(self, request, id: int):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Connect yourself to fetch this data')
        try:
            tournament = Tournament.objects.get(id=id)
        except ObjectDoesNotExist as e:
            return JsonNotFound(request, f'Tournament can\'t be found for this id : {e}')
        return JsonResponse(request, tournament.to_dict())

    def post(self, request, id:int  = 0):
        # if request.user.is_service is False:
        #     return JsonForbidden(request, 'Only Coubertin can create tournaments')
        data = request.data
        try:
            Tournament.from_json_saved(data)
        except IntegrityError as e:
            return JsonErrResponse(request, e.__str__(), status=409)
        except ValidationError as e:
            return JsonErrResponse(request, e.__str__(), status=422)
        return JsonResponse(request, {'Ressource': 'updated'})


class gameView(View):
    def post(self, request):
        if request.user.is_service is False:
            return JsonForbidden(request, "Only services can post games")
        try:
            new_game = Game.from_json_saved(request.data)
            new_game.game_db_update()
        except IntegrityError as e:
            return JsonErrResponse(request, e.__str__(), status=409)
        except ValidationError as e:
            return JsonErrResponse(request, e.__str__(), status=422)
        except BaseException as e:
            return JsonErrResponse(request, e.__str__(), status=500)
        return JsonResponse(request, new_game.to_dict())

    def delete(self, request):
        if request.user.is_admin is False:
            return JsonForbidden(request, "Only admin can delete games")
        return JsonErrResponse(request, "Not implemented delete", status=501)


class playerView(View):
    def get(self, request, id: int = 0):
        if request.user.is_autenticated is False:
            return JsonUnauthorized(request, "Connect yourself to get history")
        try:
            player = Player.objects.get(id=id)
            return_json = player.to_dict()
            return_json |= {'History': [game.to_dict() for game in Game.objects.filter(Q(winner=player) | Q(loser=player)).order_by('-id')[:15]]}
        except ObjectDoesNotExist:
            return JsonNotFound(request, f'Player {id} is not found')

        return JsonResponse(request, return_json)

    def post(self, request, id: int = 0):
        if request.user.is_service is False:
            return JsonForbidden(request, "Only services can create a player")
        player = Player()
        try:
            player.id = request.data['Id']
        except KeyError as e:
            return JsonBadRequest(request, f'Key : {str(e)} not provided.')
        return save_response(request, player)

    def delete(self, request, id: int = 0):
        if request.user.is_service is False or request.user.is_autenticated is False:
            return JsonUnauthorized(request, 'Only service can delete a player')
        try:
            player = Player.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonNotFound(request, 'no player found for the id')
        return delete_response(request, player)

    def patch(self, request, id: int = 0):
        if request.user.is_admin is False:
            return JsonForbidden(request, 'Only admin can patch a player')
        try:
            id = request.data['Id']
            elo = request.data['Elo']
        except KeyError as e:
            return JsonBadRequest(request, f'misses value for key : {e.__str__()}')

        try:
            id = int(id)
            elo = int(elo)
        except (ValueError, TypeError):
            return JsonBadRequest(request, f'{id} is not a valid id')

        try:
            player = Player.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonNotFound(request, 'no player for the id')
        player.elo = elo
        return save_response(request, player)
