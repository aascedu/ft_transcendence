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

            if game['Round'] == 1:
                roundOne.append(gameFront)
            elif game['Round'] == 2:
                roundTwo.append(gameFront)
            elif game['Round'] == 3:
                roundThree.append(gameFront)

        bracket['RoundOne'] = roundOne
        bracket['RoundTwo'] = roundTwo
        bracket['RoundThree'] = roundThree

        response = {
            'Id': self.id,
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