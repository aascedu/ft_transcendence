class Tournament:
    def __init__(self, name, nbPlayers, id, admin):
        self.id = id
        self.name = name
        self.admin = admin
        self.nbPlayers = nbPlayers
        self.state = 0 # 0 = inscription, 1 = en cours, 2 = termine
        self.onGoingGames = 0
        self.currentRound = 0
        self.players = [] # Id du player dans le tournoi
        self.gameHistory = [] # Liste des dictionnaires de games
        self.playersMap = {} # Key: id in tournament, Value: global id

    def addPlayer(self, player):
        if (len(self.players) >= self.nbPlayers):
            raise Exception("Too many players already")
        self.players += player

    def removePlayer(self, playerId):
        if (playerId not in self.players):
            raise Exception ("This player is not participating in this tournament")
        if self.state == 0:
            self.players.remove(playerId)
        else: # Debug
            print("you tried to remove a player during a tournament")

    def addGame(self, game):
        game['Round'] = self.currentRound
        self.gameHistory.append(game)
        self.onGoingGames -= 1

    def toDict(self):
        tournamentDict = {
            'Name': self.name,
            'Players': self.playersMap,
            'Games': self.gameHistory,
            'NbPlayers': self.nbPlayers,
            'Admin': self.admin,
        }
        return (tournamentDict)
    
    def testMnemosine(self):
        games = []
        games.append({
            'Round': 0,
            'Winner': 0,
            'Winner-score': 1,
            'Loser': 5,
            'Loser-score': 2,
        })
        games.append({
            'Round': 1,
            'Winner': 2,
            'Winner-score': 4,
            'Loser': 1,
            'Loser-score': 5,
        })
        games.append({
            'Round': 2,
            'Winner': 0,
            'Winner-score': 7,
            'Loser': 5,
            'Loser-score': 4,
        })

        tournamentDict = {
            'Name': self.name,
            'Players': [0, 1, 2, 3, 4, 5, 6, 7],
            'Games': games,
            'NbPlayers': self.nbPlayers,
            'Admin': self.admin,
            'Winner': 0,
        }
        return tournamentDict
    

tournaments = {}
