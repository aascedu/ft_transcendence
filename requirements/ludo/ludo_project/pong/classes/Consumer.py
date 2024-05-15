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

# Sleep at the end of a point ?
# Protect ws in case of wrong data
# Fetch id of someone and open the good ws

from shared.BasicConsumer import OurBasicConsumer

class Consumer(OurBasicConsumer):

    async def connect(self):
        global matches

        if "err" in self.scope:
            return self.close()

        self.roomName = self.scope["url_route"]["kwargs"]["roomName"]
        print("Room name is " + self.roomName)

        if self.roomName not in matches:
            matches[self.roomName] = Match()

        await self.channel_layer.group_add(self.roomName, self.channel_name)

        self.lastRequestTime = 0
        self.myMatch = matches[self.roomName]
        self.gameSettings = gameSettings() # Voir si on peut faire autrement

        self.id = len(self.myMatch.players)
        self.isPlayer = True
        if self.id > 1:
            self.isPlayer = False # a tester !
            self.id = 0

        if self.isPlayer :
            user = self.scope['user']
            self.myMatch.playersId[self.id] = user.id
            
        await self.accept()

    async def disconnect(self, close_code):
        global matches

        del self.myMatch.players[self.id]
        await self.channel_layer.group_discard(self.roomName, self.channel_name)

    # Receive message from front
    async def receive(self, text_data):
        global matches

        # Check if the request is good here
        try:
            currentTime = time.time_ns()
            if currentTime - self.lastRequestTime < 9800000:
                return
            self.lastRequestTime = currentTime

            gameDataJson = json.loads(text_data)
            self.type = gameDataJson["type"]

            # Send to room group
            if self.type == "gameStart":
                await self.channel_layer.group_send(
                    self.roomName, {
                        "type": self.type,
                        "id": gameDataJson["id"]
                    }
                )

            elif self.type == "gameState":
                await self.channel_layer.group_send(
                    self.roomName, {
                        "type": "myState",
                        "id": self.id,
                        "frames": gameDataJson["frames"],
                    }
                )

        except Exception as e:
            print(e)
            await self.send (text_data=json.dumps({'err': e})
            await self.close()

    async def gameStart(self, event):
        global matches

        print("This is from the gameStart function")

        self.myMatch.players.append(Player(self.id, self.gameSettings)) # A check avec le viewer !!
        self.myMatch.ball = Ball(self.gameSettings)

        await self.send (text_data=json.dumps({
            "type": "gameParameters",
            "playerHeight": self.gameSettings.playerHeight,
            "playerWidth": self.gameSettings.playerWidth,
            "ballSize": self.gameSettings.ballSize,
            "ballSpeed": self.myMatch.ball.speed,
            "isPlayer": self.isPlayer,
        }))

    async def gameEnd(self, event):
        global matches
        print("This is gameEnd function with id: " + str(self.id))

        if self.id == 0:
            if self.roomName.count('-') == 2:
                requests.post(
                    'http://coubertin:8002/tournament/gameResult/',
                    json={'tournamentId': 'test',
                        'game': self.myMatch.toDict()})
            else:
                requests.post(
                    'http://mnemosine:8008/memory/pong/match/0/',
                    json=self.myMatch.to_mnemosine())
            del matches[self.roomName]

        if event["winner"] == self.id:
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

        await self.close()

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
            if len(self.myMatch.players) > 1:
                if self.myMatch.gameStarted is False:
                    self.myMatch.gameStarted = True
                    time.sleep(3)
                pointWinner = self.myMatch.ball.move(self.myMatch.players[0], self.myMatch.players[1], self.gameSettings)
                if pointWinner != -1:
                    self.myMatch.score[pointWinner] += 1
                    await self.channel_layer.group_send (
                        self.roomName, {
                            "type": "updateScore",
                        }
                    )
                if self.myMatch.score[self.id] == 5:
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
        if event["id"] == self.id:
            await self.gameLogic(event["frames"], self.id)
            if self.id % 2 == 0:
                await self.send(text_data=json.dumps({
                    "type": "myState",
                    "mePos": 100 * self.myMatch.players[self.id].pos / self.gameSettings.screenHeight,
                    "ballPosX": 100 * self.myMatch.ball.pos[0] / self.gameSettings.screenWidth,
                    "ballPosY": 100 * self.myMatch.ball.pos[1] / self.gameSettings.screenHeight,
                    "ballSpeed": 100 * self.myMatch.ball.speed / self.gameSettings.screenWidth,
                    "ballAngle": self.myMatch.ball.angle,
                    "myScore": self.myMatch.score[self.id],
                    "opponentScore": self.myMatch.score[(self.id + 1) % 2],
                }))
            else:
                await self.send(text_data=json.dumps({
                    "type": "myState",
                    "mePos": 100 * self.myMatch.players[self.id].pos / self.gameSettings.screenHeight,
                    "ballPosX": 100 * (self.gameSettings.screenWidth - self.myMatch.ball.pos[0]) / self.gameSettings.screenWidth,
                    "ballPosY": 100 * self.myMatch.ball.pos[1] / self.gameSettings.screenHeight,
                    "ballSpeed": 100 * self.myMatch.ball.speed / self.gameSettings.screenWidth,
                    "ballAngle": math.pi - self.myMatch.ball.angle,
                    "myScore": self.myMatch.score[self.id],
                    "opponentScore": self.myMatch.score[(self.id + 1) % 2],
            }))

        # Received from opponent
        else:
            await self.gameLogic(event["frames"], (self.id + 1) % 2)
            if self.id % 2 == 0:
                await self.send(text_data=json.dumps({
                    "type": "opponentState",
                    "opponentPos": 100 * self.myMatch.players[(self.id + 1) % 2].pos / self.gameSettings.screenHeight,
                    "ballPosX": 100 * self.myMatch.ball.pos[0] / self.gameSettings.screenWidth,
                    "ballPosY": 100 * self.myMatch.ball.pos[1] / self.gameSettings.screenHeight,
                    "ballSpeed": 100 * self.myMatch.ball.speed / self.gameSettings.screenWidth,
                    "ballAngle": self.myMatch.ball.angle,
                    "myScore": self.myMatch.score[self.id],
                    "opponentScore": self.myMatch.score[(self.id + 1) % 2],
                }))
            else:
                await self.send(text_data=json.dumps({
                    "type": "opponentState",
                    "opponentPos": 100 * self.myMatch.players[(self.id + 1) % 2].pos / self.gameSettings.screenHeight,
                    "ballPosX": 100 * (self.gameSettings.screenWidth - self.myMatch.ball.pos[0]) / self.gameSettings.screenWidth,
                    "ballPosY": 100 * self.myMatch.ball.pos[1] / self.gameSettings.screenHeight,
                    "ballSpeed": 100 * self.myMatch.ball.speed / self.gameSettings.screenWidth,
                    "ballAngle": math.pi - self.myMatch.ball.angle,
                    "myScore": self.myMatch.score[self.id],
                    "opponentScore": self.myMatch.score[(self.id + 1) % 2],
                }))


# Keep this id (as gameId) and add the id of the player incoming. For the time of the game use gameId, when sending result use the real id.
