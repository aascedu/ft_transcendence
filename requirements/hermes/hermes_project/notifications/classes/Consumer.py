import json
from channels.generic.websocket import AsyncWebsocketConsumer

from shared.BasicConsumer import OurBasicConsumer

class Consumer(OurBasicConsumer):
    async def connect(self):

        # Join room group

        if self.security_check() is False:
            return self.close()

        print(self.scope['user'])
        await self.channel_layer.group_add("notification_group", self.channel_name)
        print("adding friend layer")
        print(f"friend_{self.scope['user'].id}_group")

        self.get_friends()

        await self.channel_layer.group_add(f"user_{self.scope['user'].id}_group", self.channel_name)

        await self.accept()

        for friend in self.scope['friends']:
            friend_groupe = f'user_{friend}_group'

            await self.channel_layer.group_send(
                friend_groupe,
                {
                    "type": "new.client.connected",
                    "message": f'{{"connected":{self.scope['user'].id}}}',
                })

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard("notification_group", self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json['type']
        source = text_data_json['source']
        target = text_data_json['target']

        # Send message to room group
        await self.channel_layer.group_send(
            "notification_group", {
                "type": type,
                "target": target,
                "source": source,
            }
        )

    async def new_client_connected(self, event):
        await self.send(text_data=json.dumps({
            "message": event['message'],
        }))

    async def notification_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "notification.message",
            "message": event['message'],
        }))

    async def notification_new_friendship(self, event):
        print(self.scope['user'].id, " is self notifying")
        await self.send(text_data=json.dumps({
            "type": "notification.message",
            "message": event['message'],
        }))

    # Receive message from room group
    async def FriendRequest(self, event):
        if event['target'] == self.name:
            await self.send (text_data=json.dumps({
            "type": "friendRequest",
            "source": event['source'],
        }))

    async def GameInvite(self, event):
        if event['target'] == self.name:
            await self.send (text_data=json.dumps({
            "type": "gameInvite",
            "source": event['source'],
        }))

    async def TournamentInvite(self, event):
        if event['target'] == self.name:
            await self.send (text_data=json.dumps({
            "type": "tournamentInvite",
            "source": event['source'],
        }))

