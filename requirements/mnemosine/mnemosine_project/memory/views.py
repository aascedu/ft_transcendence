from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.http import JsonResponse
from django.views import View

import requests

from memory.models import Tournament, Game, Player
from shared.utils import JsonNotFound, delete_response, save_response, JsonBadRequest, JsonErrResponse, JsonForbiden

def request_get_all(ids_str, key_name, model):
    return_json = {}

    try :
        ids = [int(id) for id in ids_str]
    except BaseException as e:
        return {"Err": f"wrong query params provided {e.__str__()}"}
    try:
        querylist = model.objects.filter(id__in=ids)
    except BaseException as e:
        return {"Err": e.__str__()}
    if len(ids) != len(querylist):
        return_json |= {"Warn": "invalid ids provided"}
    return_json |= {key_name: [queryobject.to_dict() for queryobject in querylist]}
    return return_json

class tournamentView(View):
    def get(self, request, id: int = 0):
        return_json = {}

        data = request.GET.getlist('tournaments')
        return_json |= request_get_all(data, "Tournaments", Tournament)
        return JsonResponse(return_json)

    def post(self, request, id: int = 0):
        if request.user.is_service is False \
            or request.user.nick != "coubertin":
            return JsonForbiden("Only Coubertin can create tournaments")
        data = request.data
        try:
            Tournament.from_json_saved(data)
        except IntegrityError as e:
            return JsonErrResponse(e.__str__(), status=409)
        except ValidationError as e:
            return JsonErrResponse(e.__str__(), status=422)
        except BaseException as e:
            return JsonErrResponse(e.__str__(), status=500)
        return JsonResponse({"Ressource": "updated"})


class gameView(View):
    def get(self, request, id: int=0):
        return_json = {}
        queryparams = request.GET

        players = queryparams.getlist('players')
        for player in players:
            try:
                player_id = int(player)
                requestee = Player.objects.get(id=player_id)
            except ObjectDoesNotExist as e:
                return JsonNotFound(f"{player}: {e.__str__()}")
            return_json |= {player_id: {"Wins": [game.to_dict() for game in requestee.wins.all()],
                                 "Loses": [game.to_dict() for game in requestee.loses.all()]}}

        if 'latests' in queryparams:
            try:
                x = min(int(queryparams.get('latests', 10)), 10)
            except ValueError as e:
                return JsonBadRequest(e.__str__())
            latest_games = Game.objects.order_by('-id').reverse()[:x]
            return_json |= {"latests": [game.to_dict() for game in latest_games]}

        return JsonResponse(return_json)

    def post(self, request, id: int=0):
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

    def delete(self, request, id: int=0):
        if request.user.is_admin is False:
            return JsonForbiden("Only admin can delete games")
        return JsonErrResponse("Not implemented delete", status=501)


class playerView(View):
    def get(self, request, id: int = 0):
        return_json = {}

        queries = request.GET.getlist('query')
        if 'personal' in queries:
            try:
                personal_player = Player.objects.get(id=request.user.id)
                return_json |= {"Perso" : personal_player.to_dict()}
            except BaseException as e:
                return_json |= {"Err": e.__str__()}

        if 'friend' in queries:
            try:
                response = requests.get(f"http://alfred:8001/user/friends/{request.user.id}")
                friends_ids = response.json().get("Friends")
                if id in friends_ids:
                    friend = Player.objects.get(id=id)
                    return_json |= {"Friend": friend.to_dict()}
            except BaseException as e:
                return_json |= {"Err": e.__str__()}

        if 'friends' in queries:
            pass

        if 'players' in queries:
            data = request.GET.getlist('players')
            return_json |= request_get_all(data, 'Players', Player)
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
