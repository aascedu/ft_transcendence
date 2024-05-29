class Tournament:
    def __init__(self, name, nbPlayers, id, admin, invited):
        self.id = id
        self.name = name
        self.admin = admin
        self.nbPlayers = nbPlayers
        self.started = False
        self.ended = False
        self.ongoingGames = 0
        self.currentRound = 0
        self.players = [] # Id du player
        self.contenders = []
        self.invited = invited
        self.gameHistory = [] # Liste des dictionnaires de games
        print("Tournament created")

    def addPlayer(self, player):
        if len(self.players) >= self.nbPlayers:
            raise Exception("Too many players already")
        if self.userParticipating(player):
            raise Exception("Player is already participating in tournament")
        self.players.append(player)
        print("Player added") # Debug

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
        self.ongoingGames -= 1
        self.contenders.remove(game['Loser'])

    def userParticipating(self, userId):
        for i in self.players:
            if i == userId:
                return True
        return False

    def appendEmptyGameToTab(self, tab, round):
        newGame = {}
        newGame['Round'] = round # A trouver, vaut 3 2 ou 1 en fonction de i, commencer par la finale
        newGame['Game'] = {}
        newGame['Played'] = False
        tab.append(newGame)

    def toFront(self):
        games = []
        for game in self.gameHistory:
            newGame = {}
            newGame['Round'] = game['Round']
            newGame['Game'] = game
            newGame['Played'] = True
            games.append(newGame)

        gamesAlreadyPlayed = len(games)
        i = gamesAlreadyPlayed
        while i <= self.nbPlayers / 2:
            self.appendEmptyGameToTab(games, round = 1)
            i += 1
        while i <= self.nbPlayers / 2 + self.nbPlayers / 4:
            self.appendEmptyGameToTab(games, round = 2)
            i += 1
        if self.nbPlayers == 8:
            self.appendEmptyGameToTab(games, round = 3)
            i += 1

        response = {
            'Id': self.id,
            'Name': self.name,
            'NumPlayers': self.nbPlayers,
            'Started': self.started,
            'Owner': self.admin,
            'Pending': self.invited,
            'Confirmed': self.players,
            'Games': games,
        }
        return response

    def toDict(self):
        tournamentDict = {
            'Name': self.name,
            'Players': self.players,
            'Games': self.gameHistory,
            'NbPlayers': self.nbPlayers,
            'Admin': self.admin,
        }
        return tournamentDict


tournaments = {}
