from pong.classes.Match import matches, Match
from pong.classes.Player import Player
from pong.classes.GameSettings import gameSettings
from pong.classes.Ball import Ball
import time
import math
import json
import requests
import logging

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
            return self.close()

        count = self.roomName.count('-')
        if count != 1 and count != 2:
            return self.close()
        if count == 2:
            self.myMatch.isTournamentGame = True

        self.user = self.scope['user']
        try:
            p1 = int(self.roomName.split('-')[count - 1])
            p2 = int(self.roomName.split('-')[count])
            self.strId = str(self.user.id)
        except:
            return self.close()
        
        self.isPlayer = False
        self.id = len(self.myMatch.players)
        if self.id > 1:
            return self.close()

        self.opponentId = (self.id + 1) % 2

        if self.user.id == p1 or self.user.id == p2:
            self.isPlayer = True
            self.myMatch.playersId[self.id] = self.user.id
            if self.user.id == p1:
                self.myMatch.playersId[self.opponentId] = p2
            else:
                self.myMatch.playersId[self.opponentId] = p1

        else:
            self.close()

        self.lastRequestTime = 0
        self.gameSettings = gameSettings() # Voir si on peut faire autrement

        if self.isPlayer:
            self.myMatch.players.append(Player(self.id, self.gameSettings))

        logging.info("Player " + self.strId + " has entered game room " + self.roomName)

        # Faire la requete a hermes ici si besoin (Dans le cas d'une invite game)
        await self.accept()

    async def disconnect(self, close_code):
        global matches

        if self.myMatch.score[0] != 5 and self.myMatch.score[1] != 5 and self.myMatch.gameStarted:
            logging.warning("Player " + self.strId + "has unexpectedly left game room " + self.roomName)
            self.myMatch.gameEnded[self.id] = True
            self.myMatch.score[self.opponentId] = 5
            try:
                winner = self.myMatch.players[self.opponentId].id
                await self.channel_layer.group_send(
                        self.roomName, {
                            "type": "gameEnd",
                            "winner": winner,
                        }
                    )
            except BaseException as e:
                logging.error("One of the players init failed")
                return self.close()
            
            
        if self.myMatch.isTournamentGame is False:
            try:
                request = requests.post(
                    'http://hermes:8004/notif/available-states/',
                    json={'Id': self.user.id})
                if request.status_code != 200:
                    logging.error("Player " + self.strId + " state update request has failed")
            except Exception as e:
                logging.critical("Player " + self.strId + " state update request has critically failed")

        logging.info("Player " + self.strId + " has left game room " + self.roomName)
        await self.channel_layer.group_discard(self.roomName, self.channel_name)

    # Receive message from front
    async def receive(self, text_data):
        global matches

        try:
            try:
                gameDataJson = json.loads(text_data)
                self.type = gameDataJson["type"]
            except json.JSONDecodeError:
                logging.error("A non json object was received")
                return
            except KeyError:
                logging.error("No type key in received message")
                return

            # Send to room group
            if self.type == "gameStart":
                await self.channel_layer.group_send(
                    self.roomName, {
                        "type": self.type,
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

            else:
                return self.close()

        except Exception as e:
            await self.send (text_data=json.dumps({'err': e}))
            return self.close()

    async def gameStart(self, event):
        global matches

        logging.info("Game starting")
        self.myMatch.startTime = time.time_ns()

        self.myMatch.ball = Ball(self.gameSettings)

        await self.send (text_data=json.dumps({
            'type': 'gameParameters',
            'isPlayer': self.isPlayer,
        }))

    async def gameEnd(self, event):
        global matches

        if self.myMatch.gameEnded[self.id]:
            return
        self.myMatch.gameEnded[self.id] = True

        self.myMatch.endTime = time.time_ns()

        if event["winner"] == self.id:
            await self.send (text_data=json.dumps({
                "type": "youWin",
                "myScore": self.myMatch.score[self.id],
                "opponentScore": self.myMatch.score[self.opponentId],
                "isTournament": self.myMatch.isTournamentGame,
                "opponentId": self.myMatch.playersId[self.opponentId],
            }))
        else:
            await self.send (text_data=json.dumps({
                "type": "youLose",
                "myScore": self.myMatch.score[self.id],
                "opponentScore": self.myMatch.score[self.opponentId],
                "isTournament": self.myMatch.isTournamentGame,
		        "opponentId": self.myMatch.playersId[self.opponentId],
            }))

        if self.myMatch.gameEnded[self.opponentId]:
            if self.roomName.count('-') == 2:
                tab = self.roomName.split('-')
                tournamentId = int(tab[0])
                requests.post(
                    'http://coubertin:8002/tournament/gameResult/',
                    json={'tournamentId': tournamentId,
                        'game': self.myMatch.to_mnemosine()})
            else:
                requests.post(
                    'http://mnemosine:8008/memory/pong/games/',
                    json=self.myMatch.to_mnemosine())

            if self.roomName in matches:
                del matches[self.roomName]

        logging.info("Game in room " + self.roomName + " has ended")

    async def updateScore(self, event):
        await self.send (text_data=json.dumps({
            "type": "updateScore",
            "myScore": self.myMatch.score[self.id],
            "opponentScore": self.myMatch.score[self.opponentId],
            "isTournament": self.myMatch.isTournamentGame,
	        "opponentId": self.myMatch.playersId[self.opponentId],
        }))

    async def gameLogic(self, frames, id):
        global matches

        for frame in frames:
            try:
                self.myMatch.players[id].up = frames[frame]["meUp"]
                self.myMatch.players[id].down = frames[frame]["meDown"]
                self.myMatch.players[id].move(self.gameSettings, self.lastRequestTime)
                self.lastRequestTime = time.time_ns()
            except BaseException as e:
                return self.close()

            # Ball and score management
            try:
                pointWinner = self.myMatch.ball.move(self.myMatch.players[0], self.myMatch.players[1], self.gameSettings, self.myMatch.lastMoveTime)
                self.myMatch.lastMoveTime = time.time_ns()
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
            except BaseException as e:
                logging.error("One of the players init failed")
                return self.close()
            

    # Receive gameState from room group
    async def myState(self, event):
        global matches

        # Received from me
        if len(self.myMatch.players) > 1:
            if self.myMatch.gameStarted is False:
                self.myMatch.lastMoveTime = time.time_ns()
                self.myMatch.gameStarted = True
            if event["id"] == self.id:
                await self.gameLogic(event["frames"], self.id)
                if self.id % 2 == 0:
                    await self.send(text_data=json.dumps({
                        "type": "myState",
                        "mePos": 100 * self.myMatch.players[self.id].pos / self.gameSettings.screenHeight,
                        "opponentPos": 100 * self.myMatch.players[self.opponentId].pos / self.gameSettings.screenHeight,
                        "ballPosX": 100 * self.myMatch.ball.pos[0] / self.gameSettings.screenWidth,
                        "ballPosY": 100 * self.myMatch.ball.pos[1] / self.gameSettings.screenHeight,
                        "ballSpeedX": self.myMatch.ball.speed * math.cos(self.myMatch.ball.angle),
                        "ballSpeedY": self.myMatch.ball.speed * math.sin(self.myMatch.ball.angle),
                        "myScore": self.myMatch.score[self.id],
                        "opponentScore": self.myMatch.score[self.opponentId],
                    }))
                else:
                    await self.send(text_data=json.dumps({
                        "type": "myState",
                        "mePos": 100 * self.myMatch.players[self.id].pos / self.gameSettings.screenHeight,
                        "opponentPos": 100 * self.myMatch.players[self.opponentId].pos / self.gameSettings.screenHeight,
                        "ballPosX": 100 * (self.gameSettings.screenWidth - self.myMatch.ball.pos[0]) / self.gameSettings.screenWidth,
                        "ballPosY": 100 * self.myMatch.ball.pos[1] / self.gameSettings.screenHeight,
                        "ballSpeedX": - self.myMatch.ball.speed * math.cos(self.myMatch.ball.angle),
                        "ballSpeedY": self.myMatch.ball.speed * math.sin(self.myMatch.ball.angle),
                        "myScore": self.myMatch.score[self.id],
                        "opponentScore": self.myMatch.score[self.opponentId],
                }))
                    
        else:
            t = time.time_ns()
            if t - self.myMatch.startTime > 5000000000:
                self.myMatch.gameEnded[self.opponentId] = True
                self.myMatch.score[self.id] = 5
                await self.channel_layer.group_send(
                self.roomName, {
                    "type": "gameEnd",
                    "winner": self.id,
                }
            )
