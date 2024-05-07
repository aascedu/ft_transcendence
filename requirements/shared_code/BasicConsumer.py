from channels.generic.websocket import AsyncWebsocketConsumer

class OurBasicConsumer(AsyncWebsocketConsumer):
    def security_check(self):
        if "error" in self.scope:
            print(self.scope['error'])
            return self.close()
        self.user = self.scope["user"]
        print("all goot" "user is " ,self.scope["user"])
