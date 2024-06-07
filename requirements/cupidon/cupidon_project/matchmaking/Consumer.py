import json
from matchmaking.Player import Player, waitingList, gameRequesters
from shared.BasicConsumer import OurBasicConsumer


class Consumer(OurBasicConsumer):
    async def connect(self):
        global waitingList
        global gameRequesters

        # Join room group
        if self.security_check() is False:
            return self.close()
        self.id = self.scope['user'].id
        #Try catch
        self.requester = int(self.scope["url_route"]["kwargs"]["requester"])
        self.invited = int(self.scope["url_route"]["kwargs"]["invited"])

        if self.requester == 0 and self.invited == 0:
            await self.channel_layer.group_add("matchmakingRoom", self.channel_name)
        else:
            await self.channel_layer.group_add(str(self.id), self.channel_name)
            gameRequesters.append([self.requester, self.invited])

        elo = 500 # Requete a Brieuc
        self.me = Player(self.id, elo)
        waitingList[self.id] = self.me

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global waitingList
        await self.channel_layer.group_discard("matchmakingRoom", self.channel_name)
        self.close()

    # Receive message from WebSocket
    async def receive(self, text_data):
        global waitingList

        text_data_json = json.loads(text_data)
        type = text_data_json['type']

        # Send message to room group
        await self.channel_layer.group_send(
            "matchmakingRoom", {
                'type': type,
                'id': text_data_json['id'],
                'elo': text_data_json['elo'],
            }
        )

    async def SendToGame(self, event): # Need to manage when game invite
        if int(event['player1']) == self.me.id or int(event['player2']) == self.me.id:
            await self.send(json.dumps({
                'type': "start.game",
                'RoomName': str(event['player1']) + '-' + str(event['player2']),
            }))

            if self.me.id in waitingList:
                del waitingList[self.me.id] # Only if not from invite
            self.close()

    async def Ping(self, event):
        global waitingList

        self.me.margin += 10

        for id in waitingList:
            if (id != self.me.id and
                waitingList[id].elo > self.me.elo - self.me.margin and
                waitingList[id].elo < self.me.elo + self.me.margin):
                    await self.channel_layer.group_send(
                        "matchmakingRoom", {
                            'type': "SendToGame",
                            'player1': waitingList[self.me.id],
                            'player2': waitingList[id],
                        }
                    )

    async def Leave(self, event):
        return self.close()
