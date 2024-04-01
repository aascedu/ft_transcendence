import json
from channels.generic.websocket import AsyncWebsocketConsumer
from matchmaking.classes.Player import Player, waitingList

class Consumer(AsyncWebsocketConsumer):
    async def connect(self):
        global waitingList

        # Join room group
        await self.channel_layer.group_add("matchmakingRoom", self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        global waitingList
        await self.channel_layer.group_discard("matchmakingRoom", self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json['type']
        
        # Send message to room group
        await self.channel_layer.group_send(
            "matchmakingRoom", {
                "type": type,
                "id": text_data_json['id'],
                "elo": text_data_json['elo'],
            }
        )

    async def PlayerData(self, event):
        id = event['id']
        elo = event['elo']
        self.me = Player(id, elo)
        waitingList[id] = self.me # Get player name with the token here

    async def Ping(self, event):
        self.me.margin += 10

        for id in waitingList:
            if (id != self.me.id and
                waitingList[id].elo > self.me.elo - self.me.margin and
                waitingList[id].elo < self.me.elo + self.me.margin):
                    await self.send(json.dumps({
                            "action": "redirect", 
                            "url": "https://localhost:8000/ludo/pong/"
                                    + str(waitingList[self.me.id])
                                    + "-"
                                    + str(waitingList[id])
                                    + "/"
                            }))
