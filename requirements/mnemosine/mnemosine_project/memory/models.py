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
    games_played = models.ManyToManyField(
        'self',
        through='Game',
        related_name='players',
        symmetrical=False)
    tournaments_played = models.ManyToManyField(
        'Tournament', through='TournamentPlayer')
    turnament_win_count = models.IntegerField(
        default=define.dictionaire['default_player_tournament_win_count'])

    def to_dict(self):
        return {
            "Id": self.id,
            "Elo": self.elo,
            "Win-Count": self.win_count,
            "Lose-Count": self.win_count,
        }


class Game(baseModel):
    player1 = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='games_as_player1')
    score1 = models.IntegerField()
    player2 = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='games_as_player2')
    score2 = models.IntegerField()
    # duration = models.DurationField()

    def to_dict(self):
        return {
            "Id": self.id,
            "P1": self.player1,
            "S1": self.score1,
            "P2": self.player2,
            "S2": self.score2,
      #       "Date": self.date,
            # "Duration" : self.duration,
        }


class EloGame(baseModel):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    eloWin = models.PositiveSmallIntegerField(default=5)

    def to_dict(self):
        return {"EloWin": self.eloWin} | self.game.to_dict()
    
    @staticmethod
    def elo_update(self):
        # Algo calcul de elo

        result1 = True # True if player1 wins, False if not
        result2 = False # Same as before
        rating1 = 1000 # Rating of first player
        rating2 = 1200 # Rating of second player
        K = 300 # To adjust the speed at which the elo is modified

        P1 = 1.0 / (1.0 + pow(10, (rating1 - rating2) / 400)) # To estimate probabilty of player 1 winning
        P2 = 1.0 / (1.0 + pow(10, (rating2 - rating1) / 400)) # Same for player 2

        rating1 += K * (result1 - P1) # Change in player 1 rating
        rating2 += K * (result2 - P2) # Change in player 2 rating


class Tournament(baseModel):
    name = models.SlugField()
    games = models.ManyToManyField(Game, through='TournamentGame')

    def to_dict(self):
        return {
            "TournamentName": self.name,
            "Games": list([a.to_dict() for a in self.games.all()]),
        }


class TournamentPlayer(baseModel):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)

    class Meta: # pyright: ignore [reportIncompatibleVariableOverride]
        unique_together = ('player', 'tournament')



class TournamentGame(baseModel):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)

    class Meta: # pyright: ignore [reportIncompatibleVariableOverride]
        unique_together = ('tournament', 'game')
