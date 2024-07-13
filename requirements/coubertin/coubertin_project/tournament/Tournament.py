import requests
import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class Tournament:
    def __init__(self, name, nbPlayers, id, admin, invited):
        self.id = id
        self.name = name
        self.admin = admin
        self.nbPlayers = nbPlayers
        self.started = False
        self.ended = False
        self.ongoingGames = 0
        self.currentRound = 1
        self.players = [] # Id du player
        self.contenders = []
        self.gameHistory = [] # Liste des dictionnaires de games
        self.aliases = [] # {'id': id, 'alias': alias}
        self.invited = invited
        self.onPage = []

    def addPlayer(self, player, alias):
        if len(self.players) >= self.nbPlayers: # Pas besoin de cast ici ?
            raise Exception("Too many players already")
        if self.userParticipating(player):
            raise Exception("Player is already participating in tournament")
        self.players.append(player)
        self.aliases.append({'Id': player, 'Alias': alias})
        try:
            strPlayer = str(player)
            if strPlayer in self.invited:
                self.invited.remove(strPlayer)
        except:
            raise Exception("Invalid player")

    def addGame(self, game):
        game['Round'] = self.currentRound
        self.gameHistory.append(game)
        self.ongoingGames -= 1

        if game['Loser'] in self.contenders:
            self.contenders.remove(game['Loser'])
      

        try:
            request = requests.post(
                'http://hermes:8004/notif/available-states/',
                json={'Id': game['Loser']})
            if request.status_code != 200:
                pass
        except Exception as e:
            pass
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
                str(self.id), {
                    'type': "Leave",
                    'Id': game['Loser'],
                }
            )


        if self.ongoingGames == 0:
            self.currentRound += 1

            # Check tournament end
            if self.nbPlayers == pow(2, self.currentRound - 1):
                logging.info("Tournament " + str(self.id) + " is ending")
                async_to_sync(channel_layer.group_send)(
                    str(self.id), {
                        'type': "TournamentEnd",
                    }
                )
                return

            async_to_sync(channel_layer.group_send)(
                str(self.id), {
                    'type': 'StartGame',
                }
            )
            logging.info("Tournament " + str(self.id) + " is starting round " + str(self.currentRound))


    def userParticipating(self, userId):
        if self.started is False:
            for i in self.players:
                if i == userId:
                    return True
        else:
            for j in self.contenders:
                if j == userId:
                    return True
        return False

    def appendEmptyGameToTab(self, tab, round):
        newGame = {}
        newGame['Round'] = round
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
        while i <= self.nbPlayers / 2: # Besoin du cast ??
            self.appendEmptyGameToTab(games, round = 1)
            i += 1
        while i <= self.nbPlayers / 2 + self.nbPlayers / 4: # Besoin du cast ??
            self.appendEmptyGameToTab(games, round = 2)
            i += 1
        if self.nbPlayers == 8: # Besoin du cast ??
            self.appendEmptyGameToTab(games, round = 3)
            i += 1

        response = {
            'Id': self.id,
            'Name': self.name,
            'NumPlayers': self.nbPlayers,
            'Started': self.started,
            'Owner': self.admin,
            'Pending': self.invited,
            'Confirmed': self.aliases,
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
            'Alias': self.aliases,
        }
        return tournamentDict


tournaments = {}
