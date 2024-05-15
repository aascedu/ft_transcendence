import json
from channels.generic.websocket import AsyncWebsocketConsumer
from matchmaking.classes.Player import Player, waitingList
from shared.BasicConsumer import OurBasicConsumer


class Consumer(OurBasicConsumer):
    async def connect(self):
        global waitingList

        # Join room group
        await self.channel_layer.group_add("matchmakingRoom", self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global waitingList
        await self.channel_layer.group_discard("matchmakingRoom", self.channel_name)
        del waitingList[self.me.id]
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

    async def PlayerData(self, event):
        global waitingList

        id = event['id']
        elo = event['elo']
        self.me = Player(id, elo)
        waitingList[id] = self.me # Get player name with the token here

    async def SendToGame(self, event): # Will need to delete players from the waitingList here
        if event['player1'] == self.me.id or event['player2'] == self.me.id:
            # await self.send(json.dumps({
            #         "action": "redirect",
            #         "url": "https://localhost:8000/ludo/pong/"
            #                 + str(waitingList[event['player1']])
            #                 + "-"
            #                 + str(waitingList[event['player2']])
            #                 + "/"
            #         }))
            
            await self.send(json.dumps({
                    'action': "startGame",
                    'player1': str(waitingList[event['player1']]),
                    'player2': str(waitingList[event['player2']]),
                    }))
            
            del waitingList[self.me.id]            

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
