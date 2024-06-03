from channels.generic.websocket import AsyncWebsocketConsumer
import requests

class OurBasicConsumer(AsyncWebsocketConsumer):
    def security_check(self):
        if "error" in self.scope:
            print("error opening socket")
            print(self.scope['error'])
            return False
        print("no error security check run")
        self.user = self.scope["user"]
        print("all goot" "user is " ,self.scope["user"])
        return True

    def get_friends(self):
        id = self.scope['user'].id
        response = requests.get(f'http://alfred:8001/user/friends/{id}/')
        self.scope['friends'] = response.json().get("Friends")
        print('friends were loaded')
        print(self.scope['friends'])

