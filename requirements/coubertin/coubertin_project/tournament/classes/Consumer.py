import json
from channels.generic.websocket import AsyncWebsocketConsumer
from tournament.classes.Tournament import tournaments
import requests

class Consumer(AsyncWebsocketConsumer):
    async def connect(self):
        global tournaments

        # Join room group
        self.tournamentName = self.scope["url_route"]["kwargs"]["tournamentName"]

        self.admin = False
        if (len(tournaments[self.tournamentName].players) == 0):
            self.admin = True # Do we let the admin chose if he plays or not ?

        self.id = len(tournaments[self.tournamentName].players) # We want it to be his place in the players array
        self.myName = len(tournaments[self.tournamentName].players) # I will need the id of the player.
        print ("Tournament room name is " + self.tournamentName)

        await self.channel_layer.group_add(self.tournamentName, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global tournaments
        await self.channel_layer.group_discard(self.tournamentName, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        global tournaments

        text_data_json = json.loads(text_data)
        type = text_data_json['Type']

        if type == "removePlayer" and self.admin == True:
            tournaments[self.tournamentName].removePlayer(text_data_json['Target'])

        else:
            await self.channel_layer.group_send(
                self.tournamentName, {
                    'Type': type
                }
            )

    async def Ready(self, event): # When someone on the tournament page

        if (tournaments[self.tournamentName].state > 0 and tournaments[self.tournamentName].onGoingGames == 0):
            await self.channel_layer.group_send(
                self.tournamentName, {
                    'Type': "StartRound",
                }
            )

    async def Start(self, event): # Only for admin
        global tournaments
        if (self.admin == False):
            return

        tournaments[self.tournamentName].state += 1
        await self.channel_layer.group_send(
                self.tournamentName, {
                    'Type': "StartRound",
                }
            )
    async def StartRound(self, event): # Sent by every single players
        global tournaments

        if (self.admin):
            tournaments[self.tournamentName].onGoingGames = len(tournaments[self.tournamentName].players) / 2 # Check this in case of disconnected participants
            tournaments[self.tournamentName].currentRound += 1

            # Check tournament end
            if (tournaments[self.tournamentName].players == 1):
                tournaments[self.tournamentName].state += 1
                requests.post(
                        f'http://mnemosine:8008/memory/pong/tournaments/0',
                        json=tournaments[self.tournamentName].toDict())
                return


        await self.send(json.dumps({
                'Action': "startMatch",
                'TournamentName': tournaments[self.tournamentName].name,
                'Player1': tournaments[self.tournamentName].players[self.id - self.id % 2],
                'Player2': tournaments[self.tournamentName].players[self.id + (1 - self.id % 2)],
                }))

    async def TournamentState(self, event):
        await self.send(json.dumps({
            'Action': "tournamentState",
            'Tournament': tournaments[self.tournamentName].toDict(),
            }))
        
        
# To do
# Remove someone from tournament if admin
# Rename tournament, WARNING: need to change everywhere !!!

# Parcours utilisateur
# Creation du tournoi -> view correspondante, puis redirection automatique sur la page d'accueil
# Inscription au tournoi -> view correspondante, puis redirection automatique sur la page d'accueil
# L'admin lance le tournoi via un bouton, on change le state, (notif), on envoie le premier startRound ?
# Chaque fin de match (donc quand on arrive a nouveau sur l'url du tournoi), on regarde si c'est la fin du tournoi ou la fin du round (auquel cas on lance le round suivant)
# Fin du tournoi: renvoyer tous les joueurs sur la page d'accueil et maj de la db
            
