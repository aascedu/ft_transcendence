from channels.generic.websocket import AsyncWebsocketConsumer
import requests
import logging

class OurBasicConsumer(AsyncWebsocketConsumer):
    def security_check(self):
        if "error" in self.scope:
            logging.error(self.scope['error'])
            return False
        logging.debug("no error security check run")
        self.user = self.scope["user"]
        logging.debug("all goot user is " ,self.scope["user"])
        return True

    def get_friends(self):
        id = self.scope['user'].id
        try:
            response = requests.get(f'http://alfred:8001/user/friends/{id}/')
            self.scope['friends'] = response.json().get("Friends")
        except BaseException:
            logging.warn("Friends couldn't be fetch from alfred")
            self.scope['friends'] = []


