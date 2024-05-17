from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db.models import Q
from django.http import JsonResponse
from django.views import View

import requests

from memory.models import Tournament, Game, Player
from shared.utils import JsonNotFound, JsonUnauthorized, delete_response, save_response, JsonBadRequest, JsonErrResponse, JsonForbiden


class tournamentView(View):
    def get(self, request, id: int):


        try:
            player = Player.objects.get(id=id)
        except ObjectDoesNotExist:
            JsonNotFound("Id is not found in db")
        return_json = {player.id: [tournament.to_dict() for tournament in player.tournaments.all()]}

        return JsonResponse(return_json)

    def post(self, request, id:int  = 0):
        if request.user.is_service is False:
            return JsonForbiden("Only Coubertin can create tournaments")
        data = request.data
        try:
            Tournament.from_json_saved(data)
        except IntegrityError as e:
            return JsonErrResponse(e.__str__(), status=409)
        except ValidationError as e:
            return JsonErrResponse(e.__str__(), status=422)
        return JsonResponse({"Ressource": "updated"})


class gameView(View):
    def post(self, request):
        if request.user.is_service is False:
            return JsonForbiden("Only services can post games")
        try:
            new_game = Game.from_json_saved(request.data)
            new_game.game_db_update()
        except IntegrityError as e:
            return JsonErrResponse(e.__str__(), status=409)
        except ValidationError as e:
            return JsonErrResponse(e.__str__(), status=422)
        except BaseException as e:
            return JsonErrResponse(e.__str__(), status=500)
        return JsonResponse(new_game.to_dict())

    def delete(self, request):
        if request.user.is_admin is False:
            return JsonForbiden("Only admin can delete games")
        return JsonErrResponse("Not implemented delete", status=501)


class playerView(View):
    def get(self, request, id: int = 0):
        if request.user.is_autenticated is False:
            return JsonUnauthorized("Connect yourself to get history")
        try:
            player = Player.objects.get(id=id)
            return_json = player.to_dict()
            return_json |= {'History': [game.to_dict() for game in Game.objects.filter(Q(winner=player) | Q(loser=player)).order_by('-id')[:15]]}
        except ObjectDoesNotExist:
            return JsonNotFound("Player is not found")

        return JsonResponse(return_json)

    def post(self, request, id: int = 0):
        if request.user.is_service is False:
            return JsonErrResponse("Only services can create a player", status=401)
        player = Player()
        try:
            player.id = request.data['Id']
        except KeyError as e:
            return JsonBadRequest(f"Key : {str(e)} not provided.")
        return save_response(player)

    def delete(self, request, id: int = 0):
        if request.user.is_service is False \
            or request.user.nick != "petrus":
            return JsonErrResponse("Only petrus can delete a player", status=401)
        try:
            id = request.data['Id']
        except KeyError as e:
            return JsonBadRequest(f"misses value for key : {e.__str__()}")
        try:
            player = Player.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse("no player for the id", status=404)
        return delete_response(player)

    def patch(self, request, id: int = 0):
        if request.user.is_admin is False:
            return JsonErrResponse("Only admin can patch a player", status=401)
        try:
            id = request.data['Id']
            elo = request.data['Elo']
        except KeyError as e:
            return JsonBadRequest(f"misses value for key : {e.__str__()}")

        try:
            id = int(id)
            elo = int(elo)
        except (ValueError, TypeError):
            return JsonBadRequest(f"{id} is not a valid id")

        try:
            player = Player.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonErrResponse("no player for the id", status=404)
        player.elo = elo
        return save_response(player)
