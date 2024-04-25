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
        self.startTime = 0

    def toDict(self):
        return ({
            'Player1': self.players[0].id,
            'Player2': self.players[1].id,
            'Score1': self.score[0],
            'Score2': self.score[1],
        })

    def to_mnemosine(self):
        if self.score[0] < self.score[1]:
            return ({
                'Winner': self.players[1].id,
                'Winner-score': self.score[1],
                'Loser': self.players[0].id,
                'Loser-score': self.score[0],
            })
        else:
            return ({
                'Loser': self.players[1].id,
                'Loser-score': self.score[1],
                'Winner': self.players[0].id,
                'Winner-score': self.score[0],
            })

matches = {}
