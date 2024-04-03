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
    # tournaments_played = models.ManyToManyField(
    #     'Tournament', through='TournamentPlayer')
    # turnament_win_count = models.IntegerField(
    #     default=define.dictionaire['default_player_tournament_win_count'])

    def to_dict(self):
        return {
            "Id": self.id,
            "Elo": self.elo,
            "Win-Count": self.win_count,
            "Lose-Count": self.win_count,
        }

    def __str__(self):
        return f"{self.id}, {self.wins.all()}, {self.loses.all()}"


class Game(baseModel):
    winner = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='loses')
    winner_score = models.IntegerField()
    loser = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='wins')
    loser_score = models.IntegerField()

    # duration = models.DurationField()

    def to_dict(self):
        return {
            "Id": self.id,
            "Winner": self.winner.id,
            "Winner-score": self.winner_score,
            "Loser": self.loser.id,
            "Loser-score": self.loser_score,
            # "Date": self.date,
            # "Duration" : self.duration,
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
        #update elo and win lose count
        self.save()


    @staticmethod
    def elo_update():
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

        created_tournament = Tournament.objects.create(
                name=json['Name'],
            )

        for tournamentgame in game_array:
            created_tournament.games.add(tournamentgame.game)
        return created_tournament


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

    @staticmethod
    def from_json(json):
        tournament_game_created = TournamentGame()
        tournament_game_created.game = Game.from_json(json)
        return tournament_game_created
