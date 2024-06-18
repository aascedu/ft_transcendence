import json
from matchmaking.Player import Player, waitingList, gameRequesters
from shared.BasicConsumer import OurBasicConsumer
import logging
import requests

# Faire en sorte qu'une seule personne a la fois ne cherche. (mutex ou whatever)

class Consumer(OurBasicConsumer):
    async def connect(self):
        global waitingList
        global gameRequesters

        # Join room group
        if self.security_check() is False:
            await self.close()

        self.id = int(self.scope['user'].id)
        if self.id in waitingList:
            await self.close()

        #Try catch
        self.requester = int(self.scope["url_route"]["kwargs"]["requester"])
        self.invited = int(self.scope["url_route"]["kwargs"]["invited"])

        if self.requester == 0 and self.invited == 0:
            await self.channel_layer.group_add("matchmakingRoom", self.channel_name)
        else:
            await self.channel_layer.group_add(str(self.id), self.channel_name)
            gameRequesters.append([self.requester, self.invited])

        try:
            response = requests.get(
                f"http://mnemosine:8008/memory/pong/elo/{self.scope['user'].id}/"
            )
            elo = response.json()['elo']
            waitingList[self.id] = Player(self.id, elo)

        except Exception as e:
            logging.error(e)
            self.close()

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global waitingList
        global gameRequesters

        if self.id in waitingList:
            del waitingList[self.id]
        if self.id in gameRequesters:
            gameRequesters.remove(self.id)

        await self.channel_layer.group_discard("matchmakingRoom", self.channel_name)
        self.close()

    # Receive message from WebSocket
    async def receive(self, text_data):
        global waitingList

        try:
            text_data_json = json.loads(text_data)
            action = text_data_json['type']
        except json.JSONDecodeError:
            logging.error("A non json object was received")
            return
        except KeyError:
            logging.error("No type key in received message")
            return

        # Send message to room group
        await self.channel_layer.group_send(
            "matchmakingRoom", {
                'type': action,
                'id': waitingList[self.id].id,
                'elo': waitingList[self.id].elo,
            }
        )

    async def SendToGame(self, event): # Need to manage when game invite
        if int(event['player1']) == self.id or int(event['player2']) == self.id:
            await self.send(json.dumps({
                'type': "start.game",
                'RoomName': str(event['player1']) + '-' + str(event['player2']),
            }))

            if self.id in waitingList:
                del waitingList[self.id] # Only if not from invite

    async def Ping(self, event):
        global waitingList

        if self.id != int(event['id']):
            return
        waitingList[self.id].margin += 10

        for id, player in waitingList.items():
            if (id != self.id and
                waitingList[id].elo > waitingList[self.id].elo - waitingList[self.id].margin and
                waitingList[id].elo < waitingList[self.id].elo + waitingList[self.id].margin):
                    logging.info("Sending to game from id: " + str(self.id) + " against: " + str(id))
                    await self.channel_layer.group_send(
                        "matchmakingRoom", {
                            'type': "SendToGame",
                            'player1': self.id,
                            'player2': id,
                        }
                    )
                    return

    async def Leave(self, event):
        print("Player closing: " + str(self.id))
        self.close()
