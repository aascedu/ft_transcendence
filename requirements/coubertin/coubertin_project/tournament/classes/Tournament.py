class Tournament:
    def __init__(self, name, nbPlayers, id):
        self.nbPlayers = nbPlayers
        self.id = id
        self.name = name
        self.state = 0 # 0 = inscription, 1 = en cours, 2 = termine
        self.onGoingGames = 0
        self.currentRound = 0
        self.players = [] # Id du player dans le tournoi
        self.gameHistory = [] # Liste des dictionnaires de games
        self.playersMap = {} # Key: id in tournament, Value: global id

    def addPlayer(self, player):
        if (len(self.players) >= self.nbPlayers):
            raise Exception('Too many players already')
        self.players += player

    def addGame(self, game):
        game['Round'] = self.currentRound
        self.gameHistory.append(game)
        self.onGoingGames -= 1

    def toDict(self):
        tournamentDict = {
            'Name': self.name,
            'Players': self.playersMap,
            'Games': self.gameHistory,
        }
        return (tournamentDict)
    
    def removePlayer(self, playerId):
        if self.state == 0:
            self.players.remove(playerId)
        else: # Debug
            print("you tried to remove a player during a tournament")

tournaments = {}
