from channels.generic.websocket import AsyncWebsocketConsumer
from pong.classes.Match import matches, Match
from pong.classes.Player import Player
from pong.classes.GameSettings import gameSettings
from pong.classes.Ball import Ball
import time
import math
import json
import requests

# match[self.id] = moi
# match[(self.id + 1) % 2] = adversaire

# tester si c'est un viewer ou un joueur

from shared.BasicConsumer import OurBasicConsumer

class Consumer(OurBasicConsumer):

    async def connect(self):
        global matches

        self.roomName = self.scope["url_route"]["kwargs"]["roomName"]
        print("Room name is " + self.roomName)

        if (self.roomName not in matches):
            matches[self.roomName] = Match()

        await self.channel_layer.group_add(self.roomName, self.channel_name)

        self.myMatch = matches[self.roomName]
        self.id = len(self.myMatch.players)
        self.isPlayer = True
        if (self.id > 1):
            self.isPlayer = False # a tester !
            self.id = 0
        self.gameSettings = gameSettings() # Voir si on peut faire autrement
        self.lastRequestTime = 0

        await self.accept()

    async def disconnect(self, close_code):
        global matches

        del self.myMatch.players[self.id]
        await self.channel_layer.group_discard(self.roomName, self.channel_name)

    # Receive message from front
    async def receive(self, text_data):
        global matches

        # Check if the request is good here
        currentTime = time.time_ns()
        if (currentTime - self.lastRequestTime < 9800000):
            return
        self.lastRequestTime = currentTime

        gameDataJson = json.loads(text_data)
        self.type = gameDataJson["type"]

        # Send to room group
        if (self.type == "gameStart"):
            await self.channel_layer.group_send(
                self.roomName, {
                    "type": self.type,
                    "id": gameDataJson["id"]
                }
            )

        elif (self.type == "gameState"):
            await self.channel_layer.group_send(
                self.roomName, {
                    "type": "myState",
                    "id": self.id,
                    "frames": gameDataJson["frames"],
                }
            )

    async def gameStart(self, event):
        global matches

        print("This is from the gameStart function")

        self.myMatch.players.append(Player(self.id, self.gameSettings)) # A check avec le viewer !!
        self.myMatch.ball = Ball(self.gameSettings)
        self.myMatch.playersId[self.id] = event["id"]

        await self.send (text_data=json.dumps({
            "type": "gameParameters",
            "playerHeight": self.gameSettings.playerHeight,
            "playerWidth": self.gameSettings.playerWidth,
            "ballSize": self.gameSettings.ballSize,
            "ballSpeed": self.myMatch.ball.speed,
            "isPlayer": self.isPlayer,
        }))

    async def gameEnd(self, event):
        # Si game de tournoi, envoyer au tournoi, sinon envoyer a la db.
        print("This is gameEnd function")
        if (self.roomName.count('-') == 2 and self.id == 0): # N'envoyer qu'avec l'hote
            requests.post(
                'http://coubertin:8002/tournament/gameResult/',
                json={'tournamentId': 'test',
                      'game': self.myMatch.toDict()}) # Allo faut recuperer l'id ici Henri !!
        elif (self.id == 0):
            requests.post(
                'http://mnemosine:8008/memory/pong/match/0/',
                json={self.myMatch.to_mnemosine()})
        # requests.post() # Poster direct a la db

        if (event["winner"] == self.id):
            await self.send (text_data=json.dumps({
                "type": "youWin",
                "myScore": self.myMatch.score[self.id],
                "opponentScore": self.myMatch.score[(self.id + 1) % 2],
            }))
        else:
            await self.send (text_data=json.dumps({
                "type": "youLose",
                "myScore": self.myMatch.score[self.id],
                "opponentScore": self.myMatch.score[(self.id + 1) % 2],
            }))

    async def updateScore(self, event):
        await self.send (text_data=json.dumps({
            "type": "updateScore",
            "myScore": self.myMatch.score[self.id],
            "opponentScore": self.myMatch.score[(self.id + 1) % 2],
        }))

    async def gameLogic(self, frames, id):
        global matches

        for frame in frames:
            self.myMatch.players[id].up = frames[frame]["meUp"]
            self.myMatch.players[id].down = frames[frame]["meDown"]
            self.myMatch.players[id].move(self.gameSettings)

            # Ball and score management
            if (len(self.myMatch.players) > 1):
                if self.myMatch.gameStarted is False:
                    self.myMatch.gameStarted = True
                    time.sleep(3)
                pointWinner = self.myMatch.ball.move(self.myMatch.players[0], self.myMatch.players[1], self.gameSettings)
                if (pointWinner != -1):
                    self.myMatch.score[pointWinner] += 1
                    await self.channel_layer.group_send (
                        self.roomName, {
                            "type": "updateScore",
                        }
                    )
                if (self.myMatch.score[self.id] == 5):
                    await self.channel_layer.group_send (
                        self.roomName, {
                            "type": "gameEnd",
                            "winner": self.id
                        }
                    )

    # Receive gameState from room group
    async def myState(self, event):
        global matches

        # Received from me
        if (event["id"] == self.id): # Remplacer event["id"] par le check du JWT, cf Brieuc.
            await self.gameLogic(event["frames"], self.id)
            if (self.id % 2 == 0):
                await self.send(text_data=json.dumps({
                    "type": "myState",
                    "mePos": self.myMatch.players[self.id].pos,
                    "ballPosX": self.myMatch.ball.pos[0],
                    "ballPosY": self.myMatch.ball.pos[1],
                    "ballSpeed": self.myMatch.ball.speed,
                    "ballAngle": self.myMatch.ball.angle,
                }))
            else:
                await self.send(text_data=json.dumps({
                    "type": "myState",
                    "mePos": self.myMatch.players[self.id].pos,
                    "ballPosX": self.gameSettings.screenWidth - self.myMatch.ball.pos[0],
                    "ballPosY": self.myMatch.ball.pos[1],
                    "ballSpeed": self.myMatch.ball.speed,
                    "ballAngle": math.pi - self.myMatch.ball.angle,
            }))

        # Received from opponent
        else:
            await self.gameLogic(event["frames"], (self.id + 1) % 2)
            if (self.id % 2 == 0):
                await self.send(text_data=json.dumps({
                    "type": "opponentState",
                    "opponentPos": self.myMatch.players[(self.id + 1) % 2].pos,
                    "ballPosX": self.myMatch.ball.pos[0],
                    "ballPosY": self.myMatch.ball.pos[1],
                    "ballSpeed": self.myMatch.ball.speed,
                    "ballAngle": self.myMatch.ball.angle,
                }))
            else:
                await self.send(text_data=json.dumps({
                    "type": "opponentState",
                    "opponentPos": self.myMatch.players[(self.id + 1) % 2].pos,
                    "ballPosX": self.gameSettings.screenWidth - self.myMatch.ball.pos[0],
                    "ballPosY": self.myMatch.ball.pos[1],
                    "ballSpeed": self.myMatch.ball.speed,
                    "ballAngle": math.pi - self.myMatch.ball.angle,
                }))


# Keep this id (as gameId) and add the id of the player incoming. For the time of the game use gameId, when sending result use the real id.
