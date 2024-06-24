from pong.classes.GameSettings import gameSettings
from pong.classes.Ball import Ball

# A init autrement
class Match:
    def __init__(self):
        self.playersId = [0, 0]
        self.players = []
        self.score = [0, 0]
        self.ball = Ball(gameSettings=gameSettings())
        self.gameStarted = False
        self.gameEnded = [False, False]
        self.isTournamentGame = False
        self.startTime = 0
        self.endTime = 0

    def to_mnemosine(self):
        if self.score[0] < self.score[1]:
            return ({
                'Winner': self.playersId[1],
                'Winner-score': self.score[1],
                'Loser': self.playersId[0],
                'Loser-score': self.score[0],
                'Duration': (self.endTime - self.startTime) / 1000000000
            })
        else:
            return ({
                'Loser': self.playersId[1],
                'Loser-score': self.score[1],
                'Winner': self.playersId[0],
                'Winner-score': self.score[0],
                'Duration': (self.endTime - self.startTime) / 1000000000
            })

matches = {}
