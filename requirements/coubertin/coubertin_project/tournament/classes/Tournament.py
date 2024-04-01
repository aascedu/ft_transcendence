class Tournament:
    def __init__(self, name, nbPlayers):
        self.nbPlayers = nbPlayers
        self.name = name
        self.state = 0 # 0 = inscritpion, 1 = en cours, 2 = termine
        self.onGoingGames = 0
        self.currentRound = 1
        self.players = []
        self.gameHistory = [] # Liste des dictionnaires de games

    def addPlayer(self, player):
        if (len(self.players) >= self.nbPlayers):
            raise Exception('Too many players already') 
        self.players += player

    def addGame(self, game):
        game['round'] = self.currentRound
        self.gameHistory.append(game)
        self.onGoingGames -= 1
                
tournaments = {}
