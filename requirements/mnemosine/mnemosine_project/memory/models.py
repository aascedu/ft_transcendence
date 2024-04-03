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
            "Id": self.id,
            "Elo": self.elo,
            "Win-Count": self.win_count,
            "Lose-Count": self.win_count,
        }


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
    def from_json(json):
        created_game = Game()
        created_game.winner = Player.objects.get(id=json['Winner'])
        created_game.loser = Player.objects.get(id=json['Loser'])
        created_game.winner_score = json['Winner-score']
        created_game.loser_score = json['Loser-score']
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


class Tournament(baseModel):
    name = models.SlugField()
    games = models.ManyToManyField(Game, through='TournamentGame', blank=True)

    def to_dict(self):
        return {
            "TournamentName": self.name,
            "Games": list([a.to_dict() for a in self.games.all()]),
        }

    @staticmethod
    def from_json(json):
        created_tournament = Tournament()
        game_array = [TournamentGame.from_json(game) for game in json['Games']]

        for tournamentgame in game_array:
            created_tournament.games.add(tournamentgame.game)
        return created_tournament


class TournamentParticipation(baseModel):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='tournaments')
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)

    class Meta: # pyright: ignore [reportIncompatibleVariableOverride]
        unique_together = ('player', 'tournament')


class TournamentGame(baseModel):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)

    class Meta: # pyright: ignore [reportIncompatibleVariableOverride]
        unique_together = ('tournament', 'game')

    @staticmethod
    def from_json(json):
        tournament_game_created = TournamentGame()
        tournament_game_created.game = Game.from_json(json)
        return tournament_game_created
