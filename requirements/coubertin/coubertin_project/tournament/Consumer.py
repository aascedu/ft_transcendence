import json
from tournament.Tournament import tournaments
from shared.BasicConsumer import OurBasicConsumer
import requests
import logging

# Check ce qui se passe si l'admin quitte le tournoi

class Consumer(OurBasicConsumer):
    async def connect(self):
        global tournaments

        if self.security_check() is False:
            return self.close()
        test = self.scope['user'].id
        self.id = int(self.scope['user'].id)
        logging.debug("\n\n\n\n\n\n\nMy id when connecting: ")
        logging.debug(test)

        # Join room group
        self.roomName = self.scope["url_route"]["kwargs"]["roomName"]
        self.tournamentId = int(self.roomName)
        if self.id in tournaments[self.tournamentId].onPage:
            logging.debug("Ok we're saved\n\n\n\n\n\n\n\n")
            return self.close()
        tournaments[self.tournamentId].onPage.append(self.id)

        # self.admin = False
        # if (tournaments[self.tournamentId].admin == self.id):
        #     self.admin = True # Do we let the admin chose if he plays or not ?

        try:
            request = requests.delete(
                'http://hermes:8004/notif/available-states/',
                json={'Id': self.id})
            if request.status_code != 200:
                self.close()
        except Exception as e:
            self.close()

        await self.channel_layer.group_add(self.roomName, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global tournaments

        try:
            request = requests.post(
                'http://hermes:8004/notif/available-states/',
                json={'Id': self.id})
            if request.status_code != 200:
                self.close()
        except Exception as e:
            self.close()

        await self.channel_layer.group_discard(self.tournamentId, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        global tournaments

        logging.debug("Receiving something for the tournament\n\n\n\n")

        text_data_json = json.loads(text_data)
        type = text_data_json['Type']

        await self.channel_layer.group_send(
            self.roomName, {
                'Type': type
            }
        )

    # async def Start(self, event): # Only for admin, to start tournament
    #     global tournaments

    #     tournaments[self.tournamentId].started = True
    #     tournaments[self.tournamentId].contenders = tournaments[self.tournamentId].players

    #     await self.channel_layer.group_send(
    #             self.tournamentId, {
    #                 'Type': "StartRound",
    #             }
    #         )

    # async def StartRound(self, event): # To start a round (Will redirect every player etc...)
    #     global tournaments

        # if self.admin and tournaments[self.tournamentId].ongoingGames == 0:
        #     tournaments[self.tournamentId].currentRound += 1

        #     # Check tournament end
        #     if tournaments[self.tournamentId].NumPlayers == pow(2, tournaments[self.tournamentId].currentRound): # NumPlayers == 2 puissance currentRound
        #         await self.channel_layer.group_send(
        #             self.tournamentId, {
        #                 'Type': "TournamentEnd",
        #             }
        #         )
        #         return

        #     tournaments[self.tournamentId].ongoingGames = pow(2, tournaments[self.tournamentId].nbPlayers) / pow(2, tournaments[self.tournamentId].currentRound)

        # await self.channel_layer.group_send(
        #     self.tournamentId, {
        #         'Type': "StartGame",
        #     }
        # )

    async def StartGame(self, event):
        global tournaments
        logging.debug("Starting tournament game from back")

        myIndex = tournaments[self.tournamentId].contenders.index(self.id)
        opponentIndex = (((myIndex % 2) * 2 - 1) * -1) + myIndex
        opponentId = tournaments[self.tournamentId].contenders[opponentIndex]
        tournaments[self.tournamentId].ongoingGames += 1

        logging.debug("myId: " + str(self.id) + "\nmyIndex: " + str(myIndex) + "\nmyOpponentIndex: " + str(opponentIndex))

        roomName = str(tournaments[self.tournamentId].id) + '-' + str(min(self.id, opponentId)) + '-' + str(max(self.id, opponentId))
        await self.send(json.dumps({
            'Action': "startGame",
            'RoomName': roomName,
        }))

    async def TournamentState(self, event):
        await self.send(json.dumps({
            'Action': "tournamentState",
            'Tournament': tournaments[self.tournamentId].toFront(),
        }))

    async def LeaveTournament(self, event):
        global tournaments

        if event['player'] == self.id:
            tournaments[self.tournamentId].removePlayer(self.id)
            logging.info("Player " + str(self.id) + " has left tournament " + str(tournaments[self.tournamentId].id))
            self.close()

    async def TournamentEnd(self, event):
        global tournaments

        if tournaments[self.tournamentId].ended is False:
            return

        tournaments[self.tournamentId].ended = False

        try:
            request = requests.post(
                f'http://mnemosine:8008/memory/pong/tournaments/0/',
                json=tournaments[self.tournamentId].toDict()
            )
            if request.status_code != 200:
                logging.warning("Tournament registration in database may be corrupted")
        except Exception as e:
            logging.error("Tournament could not be registered in database")

        for player in tournaments[self.tournamentId].contenders:
            if player != self.id:
                await self.channel_layer.group_send(
                    self.tournamentId, {
                        'type': 'LeaveTournament',
                        'player': player,
                    }
                )

        del tournaments[self.id]
        logging.info("Tournament " + str(tournaments[self.tournamentId].id) + " ended")
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
