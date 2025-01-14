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
            await self.accept()
            return self.close()

        # Join room group
        self.roomName = self.scope["url_route"]["kwargs"]["roomName"]
        try:
            self.id = int(self.scope['user'].id)
            self.tournamentId = int(self.roomName)
            self.myTournament = tournaments[self.tournamentId]
        except:
            logging.error("Tournament websocket closed during initialization")
            await self.accept()
            return self.close()
            
        if self.id in self.myTournament.onPage:
            self.myTournament.onPage.append(self.id)
            logging.error("Tournament websocket closed during initialization")
            await self.accept()
            return self.close()
        self.myTournament.onPage.append(self.id)

        await self.channel_layer.group_add(self.roomName, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global tournaments

        if self.tournamentId in tournaments:
            if self.id in self.myTournament.onPage:
                self.myTournament.onPage.remove(self.id)

            if self.id in self.myTournament.players and self.myTournament.started is False:
                self.myTournament.players.remove(self.id)
                for dict in self.myTournament.aliases:
                    if dict['Id'] == self.id:
                        self.myTournament.aliases.remove(dict)

                await self.channel_layer.group_send(
                    self.roomName, {
                        'type': 'TournamentState',
                        'except': False,
                        'id': self.id,
                        'opt': 'someoneLeft',
                        'data': self.id,
                    }
                )

        await self.channel_layer.group_discard(self.roomName, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        global tournaments

        try:
            text_data_json = json.loads(text_data)
            type_value = text_data_json['Type']
        except JSONDecodeError:
            logging.error("A non json object was received")
            return
        except KeyError:
            logging.error("No type key in received message")
            return

        if type_value not in ['StartGame', 'TournamentState', 'TournamentEnd']:
            logging.error("Wrong data received by websocket")
            return self.close()

        await self.channel_layer.group_send(
            self.roomName, {
                'type': type_value
            }
        )

    async def StartGame(self, event):
        global tournaments

        if self.id not in self.myTournament.contenders:
            return
        
        myIndex = self.myTournament.contenders.index(self.id)
        opponentIndex = (((myIndex % 2) * 2 - 1) * -1) + myIndex

        try:
            opponentId = self.myTournament.contenders[opponentIndex]
        except:
            self.myTournament.ongoingGames += 1
            roomName = str(self.myTournament.id) + '-' + str(self.id) + '-0'
            await self.send(json.dumps({
                'Action': "startGame",
                'RoomName': roomName,
            }))
            return

        if self.id > opponentId or opponentId not in self.myTournament.onPage:
            self.myTournament.ongoingGames += 1

        try:
            roomName = str(self.myTournament.id) + '-' + str(min(self.id, opponentId)) + '-' + str(max(self.id, opponentId))
        except:
            return self.close()
        await self.send(json.dumps({
            'Action': "startGame",
            'RoomName': roomName,
        }))

    async def TournamentState(self, event):

        if event['except'] == True and event['id'] == self.id:
            return

        await self.send(json.dumps({
            'Action': event['opt'],
            'Data': event['data'],
            'Tournament': self.myTournament.toFront()
        }))

    async def TournamentEnd(self, event):
        global tournaments

        if self.tournamentId not in tournaments:
            return self.close()

        if self.id not in self.myTournament.contenders:
            return self.close()

        self.myTournament.ended = True
        try:
            request = requests.post(
                f'http://mnemosine:8008/memory/tournaments/0/',
                json=self.myTournament.toDict()
            )
            if request.status_code != 200:
                logging.warning("Tournament registration in database may be corrupted")
        except Exception as e:
            logging.error("Tournament could not be registered in database")

        logging.info("Tournament " + str(self.myTournament.id) + " ended")
        
        if self.tournamentId in tournaments:
            del tournaments[self.tournamentId]

        try:
            request = requests.post(
                'http://hermes:8004/notif/available-states/',
                json={'Id': self.id})
            if request.status_code != 200:
                logging.error("Available state couldn't be updated by Coubertin")
                return self.close()
        except Exception as e:
            logging.error("Available state couldn't be updated by Coubertin")
            return self.close()
        
        await self.channel_layer.group_send(
            self.roomName, {
                'type': 'LeaveAll',
            }
        )

    async def LeaveAll(self, event):
        await self.close()

    async def Leave(self, event):
        try:
            id = event['Id']
        except BaseException as e:
            logging.warning('Wrong data sent in Leave in websocket')
            await self.close()
            return

        if id == self.id:
            await self.close()
