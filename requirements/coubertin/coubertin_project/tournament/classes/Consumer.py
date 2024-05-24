import json
from channels.generic.websocket import AsyncWebsocketConsumer
from tournament.classes.Tournament import tournaments
from shared.BasicConsumer import OurBasicConsumer
import requests

class Consumer(OurBasicConsumer):
    async def connect(self):
        global tournaments

        if self.security_check() is False:
            return self.close()
        self.id = self.scope['user'].id

        # Join room group
        self.tournamentId = self.scope["url_route"]["kwargs"]["tournamentId"]
        self.myTournament = tournaments[self.tournamentId]

        self.admin = False
        if (self.myTournament.admin == self.id):
            self.admin = True # Do we let the admin chose if he plays or not ?

        print ("Tournament room name is " + self.tournamentId)

        await self.channel_layer.group_add(self.tournamentId, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global tournaments
        await self.channel_layer.group_discard(self.tournamentId, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        global tournaments

        text_data_json = json.loads(text_data)
        type = text_data_json['Type']

        await self.channel_layer.group_send(
            self.tournamentId, {
                'Type': type
            }
        )

    async def Start(self, event): # Only for admin, to start tournament
        global tournaments
        if (self.admin == False):
            return

        self.myTournament.started = True
        self.myTournament.contenders = self.myTournament.players

        await self.channel_layer.group_send(
                self.tournamentId, {
                    'Type': "StartRound",
                }
            )

    async def StartRound(self, event): # To start a round (Will redirect every player etc...)
        global tournaments

        if self.admin and self.myTournament.ongoingGames == 0:
            self.myTournament.currentRound += 1

            # Check tournament end
            if self.myTournament.NumPlayers == pow(2, self.myTournament.currentRound): # NumPlayers == 2 puissance currentRound
                requests.post(
                        f'http://mnemosine:8008/memory/pong/tournaments/0',
                        json=self.myTournament.toDict())
                
                # Deco tout le monde, faire une onction a part
                return
            
            self.myTournament.ongoingGames = pow(2, self.myTournament.nbPlayers) / pow(2, self.myTournament.currentRound)

            await self.channel_layer.group_send(
                self.tournamentId, {
                    'Type': "StartGame",
                }
            )

    async def StartGame(self, event):
        myIndex = self.myTournament.contenders.index(self.id)
        opponentIndex = (((myIndex % 2) * 2 - 1) * -1) + myIndex
        opponentId = self.myTournament.contenders[opponentIndex]

        roomName = str(self.myTournament.id) + '-' + str(min(self.id, opponentId)) + '-' + str(max(self.id, opponentId))
        await self.send(json.dumps({
            'Action': "startGame",
            'RoomName': roomName,
            }))

    async def TournamentState(self, event): # Update the state of a tournament for the front
        await self.send(json.dumps({
            'Action': "tournamentState",
            'Tournament': self.myTournament.toFront(),
            }))
        
    async def LeaveTournament(self, event):
        if event['player'] == self.id:
            self.myTournament.removePlayer(self.id)
            self.close()

    async def TournamentEnd(self, event):
        global tournaments

        requests.post(
            f'http://mnemosine:8008/memory/pong/tournaments/0',
            json=self.myTournament.toDict()
        )
        
        if self.admin:
            for player in self.myTournament.contenders:
                if player != self.admin:
                    await self.channel_layer.group_send(
                        self.tournamentId, {
                            'type': 'LeaveTournament',
                            'player': player,
                        }
                    )
            del tournaments[self.id]
            self.close()
        

# To do
# Remove someone from tournament if admin
# Rename tournament, Implement ids for tournaments

# Parcours utilisateur
# Creation du tournoi -> view correspondante, puis redirection automatique sur la page d'accueil
# Inscription au tournoi -> view correspondante, puis redirection automatique sur la page d'accueil
# L'admin lance le tournoi via un bouton, on change le state, (notif), on envoie le premier startRound ?
# Chaque fin de match (donc quand on arrive a nouveau sur l'url du tournoi), on regarde si c'est la fin du tournoi ou la fin du round (auquel cas on lance le round suivant)
# Fin du tournoi: renvoyer tous les joueurs sur la page d'accueil et maj de la db
