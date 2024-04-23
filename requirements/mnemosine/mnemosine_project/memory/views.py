from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.http import JsonResponse
from django.views import View

import requests

from memory.models import Tournament, Game, Player

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
            return JsonResponse({"Err": "Only Coubertin can create tournaments"}, status=403)
        data = request.data
        try:
            Tournament.from_json_saved(data)
        except IntegrityError as e:
            return JsonResponse({"Err": e.__str__()}, status=409)
        except ValidationError as e:
            return JsonResponse({"Err": e.__str__()}, status=422)
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()}, status=500)
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
                return JsonResponse({"Err": f"{player}: {e.__str__()}"}, status=404)
            return_json |= {player_id: {"Wins": [game.to_dict() for game in requestee.wins.all()],
                                 "Loses": [game.to_dict() for game in requestee.loses.all()]}}

        if 'latests' in queryparams:
            try:
                x = min(int(queryparams.get('latests', 10)), 10)
            except ValueError as e:
                return JsonResponse({"Err": e.__str__()})
            latest_games = Game.objects.order_by('-id').reverse()[:x]
            return_json |= {"latests": [game.to_dict() for game in latest_games]}

        return JsonResponse(return_json)

    def post(self, request, id: int=0):
        if request.user.is_service is False \
            or request.user.nick == "ludo":
                return JsonResponse({"Err": "Only Ludo can post games"}, status=403)
        try:
            new_game = Game.from_json_saved(request.data)
            new_game.game_db_update()
        except IntegrityError as e:
            return JsonResponse({"Err": e.__str__()}, status=409)
        except ValidationError as e:
            return JsonResponse({"Err": e.__str__()}, status=422)
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()}, status=500)
        return JsonResponse(new_game.to_dict())

    def delete(self, request, id: int=0):
        if request.user.is_admin is False:
            return JsonResponse({"Err": "Only admin can delete games"}, status=403)
        return JsonResponse({"Err": "Not implemented delete"}, status=501)


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
        if request.user.is_service is False \
                or request.user.nick != "petrus":
                return JsonResponse({"Err": "Only petrus can create a player"}, status=401)

        player = Player()
        try:
            player.id = request.data['Id']
        except KeyError as e:
            return JsonResponse({"Err": f"Key : {str(e)} not provided."}, status=400)
        try:
            player.save()
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()}, status=409)
        return JsonResponse({"Player": "created"})

    def delete(self, request, id: int = 0):
        if request.user.is_service is False \
            or request.user.nick != "petrus":
            return JsonResponse({"Err": "Only petrus can delete a player"}, status=401)
        try:
            id = request.data['Id']
        except KeyError as e:
            return JsonResponse({"Err": f"misses value for key : {e.__str__()}"}, status=400)
        try:
            player = Player.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"Err": "no player for the id"}, status=404)
        try:
            player.delete()
        except IntegrityError as e:
            return JsonResponse({"Err": f"Unexpected error : {e.__str__()}"}, status=500)
        return JsonResponse({"Player suppressed": True})

    def patch(self, request, id: int = 0):
        if request.user.is_admin is False:
            return JsonResponse({"Err": "Only admin can patch a player"}, status=401)
        try:
            id = request.data['Id']
            elo = request.data['Elo']
        except KeyError as e:
            return JsonResponse({"Err": f"misses value for key : {e.__str__()}"}, status=400)
        try:
            player = Player.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"Err": "no player for the id"}, status=404)
        player.elo = elo
        try:
            player.save()
        except BaseException as e:
            return JsonResponse({"Err": e.__str__()})
        return JsonResponse({"Player updated": player.to_dict()})
