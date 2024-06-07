from pong.classes.Match import matches, Match
from pong.classes.Player import Player
from pong.classes.GameSettings import gameSettings
from pong.classes.Ball import Ball
import time
import math
import json
import requests
import logging

# match[self.id] = moi
# match[(self.id + 1) % 2] = adversaire

# Sleep at the end of a point ?
# Protect ws in case of wrong data
# Fetch id of someone and open the good ws

from shared.BasicConsumer import OurBasicConsumer

class Consumer(OurBasicConsumer):

    async def connect(self):
        global matches

        self.roomName = self.scope["url_route"]["kwargs"]["roomName"]
        await self.channel_layer.group_add(self.roomName, self.channel_name)


        if self.roomName not in matches:
            matches[self.roomName] = Match()
        self.myMatch = matches[self.roomName]


        if "err" in self.scope:
            await self.close()

        count = self.roomName.count('-')
        if count != 1 and count != 2:
            await self.close()

        p1 = int(self.roomName.split('-')[count - 1])
        p2 = int(self.roomName.split('-')[count])
        self.user = self.scope['user']
        self.isPlayer = False
        self.id = len(self.myMatch.players)

        if self.user.id == p1 or self.user.id == p2:
            self.isPlayer = True
            self.myMatch.playersId[self.id] = self.user.id

        if self.isPlayer == False and len(self.myMatch.players) < 2:
            await self.close()


        self.lastRequestTime = 0
        self.gameSettings = gameSettings() # Voir si on peut faire autrement

        logging.info("Player " + str(self.user.id) + " has entered game room " + self.roomName)

        try:
            request = requests.delete(
                'http://hermes:8004/notif/available-states/',
                json={'Id': self.user.id})
            if request.status_code != 200:
                await self.close()
        except Exception as e:
            await self.close()

        # Faire la requete a hermes ici si besoin (Dans le cas d'une invite game)
        await self.accept()

    async def disconnect(self, close_code):
        global matches

        if self.myMatch.score[0] != 5 and self.myMatch.score[1] != 5 and self.myMatch.gameStarted:
            logging.warning("Player " + str(self.user.id) + "has unexpectedly left game room " + self.roomName)
            await self.channel_layer.group_send(
                    self.roomName, {
                        "type": "gameEnd",
                        "winner": self.myMatch.players[(self.id + 1) % 2].id
                    }
                )

        # Ne faire ca que si ce n'est pas une game de tournoi !!
        try:
            request = requests.post(
                'http://hermes:8004/notif/available-states/',
                json={'Id': self.user.id})
            if request.status_code != 200:
                logging.error("Player " + str(self.user.id) + " state update request has failed")
        except Exception as e:
            logging.critical("Player " + str(self.user.id) + " state update request has critically failed")

        logging.info("Player " + str(self.user.id) + " has left game room " + self.roomName)

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
            await self.send (text_data=json.dumps({'err': e}))
            await self.close()

    async def gameStart(self, event):
        global matches

        logging.info("Game starting")

        if self.isPlayer:
            self.myMatch.players.append(Player(self.id, self.gameSettings))

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

        logging.info("Game in room " + self.roomName + " has ended")

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
