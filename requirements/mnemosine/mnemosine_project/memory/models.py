from django.db import models
from memory import define

class baseModel(models.Model):
    id = models.BigAutoField(primary_key=True)
    objects = models.Manager()

    class Meta:
        abstract = True

class Player(baseModel):
    elo = models.IntegerField(default=define.dictionaire['default_player_elo'])
    win_count = models.IntegerField(
        default=define.dictionaire['default_player_win_count'])
    lose_count = models.IntegerField(
        default=define.dictionaire['default_player_lose_count'])

    def to_dict(self):
        return {
            'Id': self.id,
            'Elo': self.elo,
            'Win-Count': self.win_count,
            'Lose-Count': self.lose_count,
        }

class Tournament(baseModel):
    name = models.SlugField()
    players = models.ManyToManyField(Player, related_name="tournaments")

    def to_dict(self):
        return {
            'TournamentName': self.name,
            'Games': [a.to_dict() for a in self.games.all()],
            'players': [player.to_dict() for player in self.players.all()],
        }

    @staticmethod
    def from_json_saved(json):
        tournament = Tournament.objects.create(name=json['Name'])
        games = [TournamentGame.from_json_saved(game_array, tournament) for game_array in json['Games']]
        for game in games:
            game.tournament = tournament
        for player in Player.objects.filter(id__in=json['Players']):
            tournament.players.add(player)
        return tournament


class Game(baseModel):
    winner = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='wins')
    winner_score = models.IntegerField()
    loser = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='loses')
    loser_score = models.IntegerField()

    def to_dict(self):
        return {
            "Id": self.id,
            "Winner": self.winner.id,
            "Winner-score": self.winner_score,
            "Loser": self.loser.id,
            "Loser-score": self.loser_score,
        }

    @staticmethod
    def from_json_saved(json):
        created_game = Game()
        print(f"getting winner {json['Winner']}")
        created_game.winner = Player.objects.get(id=int(json['Winner']))
        created_game.loser = Player.objects.get(id=int(json['Loser']))
        created_game.winner_score = json['Winner-score']
        created_game.loser_score = json['Loser-score']

        created_game.full_clean()
        created_game.save()
        return created_game

    def game_db_update(self):
        rating1 = self.winner.elo
        rating2 = self.loser.elo
        elo_change_speed = 10


        self.winner.win_count += 1
        winner_coef = 1.0 / (1.0 + pow(10, (rating1 - rating2) / 400))
        self.winner.elo += elo_change_speed * (1 - winner_coef)

        self.loser.lose_count += 1
        loser_coef = 1.0 / (1.0 + pow(10, (rating2 - rating1) / 400))
        self.loser.elo += elo_change_speed * (-loser_coef)

        self.save()
        self.winner.save()
        self.loser.save()



class TournamentGame(baseModel):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    round = models.SmallIntegerField()
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='games')

    @staticmethod
    def from_json_saved(json, tournament):
        game = TournamentGame()
        game.game = Game.from_json_saved(json)
        game.tournament = tournament
        game.round = json['Round']
        if (game.round == 1):
            tournament.players.add(game.game.winner)
            tournament.players.add(game.game.loser)
        game.full_clean()
        game.save()
        return game

    def to_dict(self):
        return {
                "Id": self.id,
                "Game": self.game.to_dict(),
                "Round": self.round
        }
