import json
from json.decoder import JSONDecodeError
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
        logging.debug(test)

        # Join room group
        self.roomName = self.scope["url_route"]["kwargs"]["roomName"]
        self.tournamentId = int(self.roomName)
        if self.id in tournaments[self.tournamentId].onPage:
            return self.close()
        tournaments[self.tournamentId].onPage.append(self.id)

        # self.admin = False
        # if (tournaments[self.tournamentId].admin == self.id):
        #     self.admin = True # Do we let the admin chose if he plays or not ?

        await self.channel_layer.group_add(self.roomName, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global tournaments

        if self.id in tournaments[self.tournamentId].onPage:
            tournaments[self.tournamentId].onPage.remove(self.id)
        await self.channel_layer.group_discard(self.roomName, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        global tournaments

        logging.debug("Receiving something for the tournament\n\n\n\n")

        try:
            text_data_json = json.loads(text_data)
            type_value = text_data_json['Type']
        except JSONDecodeError:
            logging.error("A non json object was received")
            return
        except KeyError:
            logging.error("No type key in received message")
            return

        await self.channel_layer.group_send(
            self.roomName, {
                'Type': type_value
            }
        )

    async def StartGame(self, event):
        global tournaments
        logging.debug("These are the remaining contenders: ")
        logging.debug(tournaments[self.tournamentId].contenders)

        # Ici c'est chiant, self.id pour les gens qui ont perdu n'existe pas ! If ?
        if self.id not in tournaments[self.tournamentId].contenders:
            return
        
        myIndex = tournaments[self.tournamentId].contenders.index(self.id)
        opponentIndex = (((myIndex % 2) * 2 - 1) * -1) + myIndex
        opponentId = tournaments[self.tournamentId].contenders[opponentIndex]
        if opponentId not in tournaments[self.tournamentId].onPage:
            logging.info("Player " + str(self.id) + " won his game because opponent failed to connect to the game.")
            game = {
                'Winner': self.id,
                'Winner-score': 5,
                'Loser': opponentId,
                'Loser-score': 0,
                'Duration': 0
            }
            tournaments[self.tournamentId].addGame(game)
            return

        if self.id > opponentId:
            tournaments[self.tournamentId].ongoingGames += 1

        logging.debug("myId: " + str(self.id) + "\nmyIndex: " + str(myIndex) + "\nmyOpponentIndex: " + str(opponentIndex))

        roomName = str(tournaments[self.tournamentId].id) + '-' + str(min(self.id, opponentId)) + '-' + str(max(self.id, opponentId))
        await self.send(json.dumps({
            'Action': "startGame",
            'RoomName': roomName,
        }))

    async def TournamentState(self, event):

        if event['opt'] == True and event['id'] == self.id:
            return

        await self.send(json.dumps({
            'Action': "tournamentState",
            'Tournament': tournaments[self.tournamentId].toFront(),
        }))

    async def TournamentEnd(self, event):
        global tournaments

        # Check cette condition !
        if self.tournamentId not in tournaments:
            return

        if self.id not in tournaments[self.tournamentId].contenders:
            return

        logging.debug("Sending to db tournament result")
        try:
            request = requests.post(
                f'http://mnemosine:8008/memory/tournaments/0/',
                json=tournaments[self.tournamentId].toDict()
            )
            if request.status_code != 200:
                logging.warning("Tournament registration in database may be corrupted")
        except Exception as e:
            logging.error("Tournament could not be registered in database")

        logging.info("Tournament " + str(tournaments[self.tournamentId].id) + " ended")
        del tournaments[self.tournamentId]

        try:
            request = requests.post(
                'http://hermes:8004/notif/available-states/',
                json={'Id': self.id})
            if request.status_code != 200:
                self.close()
        except Exception as e:
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
