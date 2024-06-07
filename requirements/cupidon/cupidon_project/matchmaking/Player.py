class Player:
    def __init__(self, id, elo):
        self.id = id
        self.elo = elo
        self.margin = 50

waitingList = {}
gameRequesters = []