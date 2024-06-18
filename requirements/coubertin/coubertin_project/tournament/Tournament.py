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
        if len(self.players) >= int(self.nbPlayers):
            raise Exception("Too many players already")
        if self.userParticipating(player):
            raise Exception("Player is already participating in tournament")
        self.players.append(player)
        self.aliases.append({'Id': player, 'Alias': alias})
        print("player: " + str(player))
        strPlayer = str(player)
        if strPlayer in self.invited:
            self.invited.remove(strPlayer)

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
                return # Raise exception
        except Exception as e:
            return # Raise exception

        channel_layer = get_channel_layer()

        logging.debug("Ongoing game is: " + str(self.ongoingGames))
        if self.ongoingGames == 0:
            self.currentRound += 1

            # Check tournament end
            logging.debug("nb players: " + str(self.nbPlayers))
            logging.debug("my calc: " + str(pow(2, self.currentRound - 1)))

            if self.nbPlayers == int(pow(2, self.currentRound - 1)): # NumPlayers == 2 puissance currentRound
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
        while i <= int(self.nbPlayers) / 2:
            self.appendEmptyGameToTab(games, round = 1)
            i += 1
        while i <= int(self.nbPlayers) / 2 + int(self.nbPlayers) / 4:
            self.appendEmptyGameToTab(games, round = 2)
            i += 1
        if int(self.nbPlayers) == 8:
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
