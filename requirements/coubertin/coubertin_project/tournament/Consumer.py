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

        # Join room group
        self.roomName = self.scope["url_route"]["kwargs"]["roomName"]

        try:
            self.id = int(self.scope['user'].id)
            self.tournamentId = int(self.roomName)
        except BaseException as e:
            print(e)
            return self.close()
        
        try:
            r = requests.delete(
                'http://hermes:8004/notif/available-states/',
                json={'Id': self.id})
            if r.status_code == 409:
                return self.close()
            elif r.status_code != 200:
                return self.close()
        except Exception as e:
            print(e)
            return self.close()


        if self.id in tournaments[self.tournamentId].onPage:
            tournaments[self.tournamentId].onPage.append(self.id)
            print("Failed to open tournament ws 43")
            return self.close()
        tournaments[self.tournamentId].onPage.append(self.id)

        await self.channel_layer.group_add(self.roomName, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global tournaments

        if self.tournamentId in tournaments:
            if self.id in tournaments[self.tournamentId].onPage:
                tournaments[self.tournamentId].onPage.remove(self.id)

            if self.id in tournaments[self.tournamentId].players and tournaments[self.tournamentId].started == False:
                tournaments[self.tournamentId].players.remove(self.id)

            for obj in tournaments[self.tournamentId].aliases:
                if self.id == obj['Id'] and tournaments[self.tournamentId].started == False:
                    tournaments[self.tournamentId].aliases.remove(obj)

            try:
                r = requests.post(
                    'http://hermes:8004/notif/available-states/',
                    json={'Id': self.id})
                if r.status_code != 200:
                    pass
            except Exception as e:
                pass

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

        await self.channel_layer.group_send(
            self.roomName, {
                'Type': type_value
            }
        )

    async def StartGame(self, event):
        global tournaments

        print("contenders: ")
        print(tournaments[self.tournamentId].contenders)

        if self.id not in tournaments[self.tournamentId].contenders:
            return
        
        myIndex = tournaments[self.tournamentId].contenders.index(self.id)
        opponentIndex = (((myIndex % 2) * 2 - 1) * -1) + myIndex

        try:
            opponentId = tournaments[self.tournamentId].contenders[opponentIndex]
        except:
            tournaments[self.tournamentId].ongoingGames += 1
            roomName = str(self.id) + '-' + '0'
            await self.send(json.dumps({
                'Action': "startGame",
                'RoomName': roomName,
            }))
            return

        if self.id > opponentId: # Bah non du coup
            tournaments[self.tournamentId].ongoingGames += 1
        print("Ongoing games: " + str(tournaments[self.tournamentId].ongoingGames) + "\n\n\n\n\n")

        try:
            roomName = str(tournaments[self.tournamentId].id) + '-' + str(min(self.id, opponentId)) + '-' + str(max(self.id, opponentId))
        except:
            return self.close()
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
            return self.close()

        if self.id not in tournaments[self.tournamentId].contenders:
            return self.close()

        tournaments[self.tournamentId].ended = True
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
                return self.close()
        except Exception as e:
            return self.close()
        
        return self.close()
    
