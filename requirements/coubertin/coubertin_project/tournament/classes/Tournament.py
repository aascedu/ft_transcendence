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

    def toFront(self):
        bracket = {}
        roundOne = []
        roundTwo = []
        roundThree = []

        for game in self.gameHistory:
            score = []
            score.append(game['Winner-score'])
            score.append(game['Loser-score'])
            players = []
            players.append(game['Winner'])
            players.append(game['Loser'])
            gameFront = {}
            gameFront['Score'] = score
            gameFront['Players'] = players

            if game['Round'] == 0:
                roundOne.append(gameFront)
            elif game['Round'] == 1:
                roundTwo.append(gameFront)
            elif game['Round'] == 2:
                roundThree.append(gameFront)

        bracket['RoundOne'] = roundOne
        bracket['RoundTwo'] = roundTwo
        bracket['RoundThree'] = roundThree

        response = {
            'Name': self.name,
            'NumPlayers': self.nbPlayers,
            'Started': self.started,
            'Owner': self.admin,
            'Pending': self.invited,
            'Confirmed': self.players,
            'Bracket': bracket,
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
