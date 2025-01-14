import json
import logging

from notifications.cache import get_cache, set_cache, delete_cache

from shared.BasicConsumer import OurBasicConsumer


class Consumer(OurBasicConsumer):
    async def connect(self):
        # Join room group
        if self.security_check() is False:
            await self.accept()
            return self.close()
        user = self.scope['user']

        await self.channel_layer.group_add("notification_group", self.channel_name)

        apparel_count = get_cache(f'user_{user.id}')
        if apparel_count is None:
            apparel_count = 0
        apparel_count = apparel_count + 1
        set_cache(f'user_{user.id}', apparel_count)
        if get_cache(f'ava_{user.id}') is None:
            set_cache(f'ava_{user.id}', True)

        await self.channel_layer.group_add(
                f"user_{user.id}_group",
                self.channel_name)

        await self.accept()


        self.get_friends()
        for friend in self.scope['friends']:
            friend_group = f'user_{friend['Id']}_group'

            await self.channel_layer.group_send(
                friend_group,
                {
                    "type": "notification.new.friend.connected",
                    "requester": f'{self.scope['user'].id}',
                })

    async def disconnect(self, close_code):
        # Leave room group
        user = self.scope['user']
        apparel_count = get_cache(f'user_{user.id}')
        if apparel_count is not None:
            apparel_count = int(apparel_count) - 1
            if apparel_count == 0:
                delete_cache(f'ava_{user.id}')
                delete_cache(f'user_{user.id}')
            else:
                set_cache(f'user_{user.id}', apparel_count)

        logging.debug(f"disconnection of {self.scope['user']}")

        self.get_friends()
        for friend in self.scope['friends']:
            friend_group = f'user_{friend['Id']}_group'

            await self.channel_layer.group_send(
                friend_group,
                {
                    "type": "notification.friend.disconnected",
                    "requester": f'{self.scope['user'].id}',
                })

        await self.channel_layer.group_discard(
                f"user_{user.id}_group",
                self.channel_name)
        await self.channel_layer.group_discard("notification_group", self.channel_name)

    # This socket is read only
    async def receive(self, text_data):
        logging.error("This websocket is not supposed to receive anything.")
        pass

    async def notification_new_friend_connected(self, event):
        await self.send(text_data=json.dumps(event))

    async def notification_friend_disconnected(self, event):
        await self.send(text_data=json.dumps(event))

    async def notification_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def notification_new_friendship(self, event):
        await self.send(text_data=json.dumps(event))

    async def notification_friendship_refused(self, event):
        await self.send(text_data=json.dumps(event))

    async def notification_friendship_suppressed(self, event):
        await self.send(text_data=json.dumps(event))

    async def notification_friendship_request(self, event):
        await self.send (text_data=json.dumps(event))

    async def notification_game_request(self, event):
        await self.send (text_data=json.dumps(event))

    async def notification_tournament_request(self, event):
        await self.send (text_data=json.dumps(event))

    async def notification_game_accepted(self, event): # Il faut lancer les websockets de game apres reception de ce msg (type = game start)
        await self.send (text_data=json.dumps(event))

    async def notification_profile_change(self, event):
        await self.send (text_data=json.dumps(event))

    async def notification_update_state(self, event):
        await self.send (text_data=json.dumps(event))
