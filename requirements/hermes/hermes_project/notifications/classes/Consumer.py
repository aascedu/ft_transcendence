import json

from notifications.cache import get_cache, set_cache

from shared.BasicConsumer import OurBasicConsumer


class Consumer(OurBasicConsumer):
    async def connect(self):
        # Join room group
        if self.security_check() is False:
            return self.close()
        user = self.scope['user']

        await self.channel_layer.group_add("notification_group", self.channel_name)

        apparel_count = get_cache(f'user_{user.id}')
        if apparel_count is None:
            apparel_count = 0
        apparel_count = apparel_count + 1
        set_cache(f'user_{user.id}', apparel_count)
        self.get_friends()

        await self.channel_layer.group_add(
                f"user_{user.id}_group",
                self.channel_name)

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
        user = self.scope['user']
        apparel_count = get_cache(f'user_{user.id}')
        apparel_count = apparel_count - 1
        if apparel_count == 0:
            delete_cache(f'user_{user.id}')
        else:
            set_cache(f'user_{user.id}', apparel_count)

        await self.channel_layer.group_discard(
                f"user_{user.id}_group",
                self.channel_name)
        await self.channel_layer.group_discard("notification_group", self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        pass
        # text_data_json = json.loads(text_data)
        # type = text_data_json['type']
        # source = text_data_json['source']
        # target = text_data_json['target']

        # # Send message to room group
        # await self.channel_layer.group_send(
        #     "notification_group", {
        #         "type": type,
        #         "target": target,
        #         "source": source,
        #     }
        # )

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
    # async def notification_friendship_request(self, event):
    #     if event['target'] == self.name:
    #         await self.send (text_data=json.dumps({
    #             "type": "notification.message",
    #             "message": event['message'],
    #             # "type": "friendRequest",
    #             # "source": event['source'],
    #         }))

    async def notification_game_request(self, event):
        user = self.scope['user']

        if event['notified'] == user.id:
            await self.send (text_data=json.dumps({
                "type": "notification.message",
                "message": event['message'],
            }))

