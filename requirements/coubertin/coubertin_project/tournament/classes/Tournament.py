class Tournament:
    def __init__(self, name, nbPlayers, id, admin, invited):
        self.id = id
        self.name = name
        self.admin = admin
        self.nbPlayers = nbPlayers
        self.started = False
        self.onGoingGames = 0
        self.currentRound = 0
        self.players = [] # Id du player
        self.invited = invited
        self.gameHistory = [] # Liste des dictionnaires de games
        print("Tournament created")

    def addPlayer(self, player):
        if (len(self.players) >= self.nbPlayers):
            raise Exception("Too many players already")
        self.players += player

    def removePlayer(self, playerId):
        if (playerId not in self.players):
            raise Exception ("This player is not participating in this tournament")
        if self.started == False:
            self.players.remove(playerId)
        else: # Debug
            print("you tried to remove a player during a tournament")

    def addGame(self, game):
        game['Round'] = self.currentRound
        self.gameHistory.append(game)
        self.onGoingGames -= 1

    def userParticipating(self, userId):
        for i in self.players:
            if i == userId:
                return True
        return False

    def toDict(self):
        tournamentDict = {
            'Name': self.name,
            'Players': self.players,
            'Games': self.gameHistory,
            'NbPlayers': self.nbPlayers,
            'Admin': self.admin,
        }
        return (tournamentDict)
    

tournaments = {}
