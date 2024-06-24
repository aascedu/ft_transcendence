import math
import time

# La balle est dans le repere de l'hote
class Ball:

    def __init__(self, gameSettings):
        self.pos = [gameSettings.screenWidth / 2, gameSettings.screenHeight / 2]
        self.speed = gameSettings.screenWidth / 3
        self.angle = math.pi
        self.size = gameSettings.ballSize
        self.lastWallCollision = 0

    def newPoint(self, gameSettings, player1, player2):
        self.pos = [gameSettings.screenWidth / 2, gameSettings.screenHeight / 2]
        self.speed = gameSettings.screenWidth / 3
        self.angle = math.pi
        self.size = gameSettings.ballSize
        player1.pos = gameSettings.screenHeight / 2
        player2.pos = gameSettings.screenHeight / 2

    def isPlayerCollision(self, player):
        if self.pos[1] + self.size / 3 > player.pos - (player.height / 2) and self.pos[1] - self.size / 3 < player.pos + (player.height / 2):
            return True
        return False

    def hostCollision(self, gameSettings, host):
        if self.pos[0] - self.size / 2 < 10 + gameSettings.playerWidth and self.isPlayerCollision(host) and math.cos(self.angle) < 0:
            impactToMid = ((self.pos[1] - host.pos) / (host.height * 0.5))
            self.angle = (math.pi / 4) * impactToMid
            self.speed *= 1.1
            if self.speed > 2000:
                self.speed = 2000

    def clientCollision(self, client, gameSettings):
        if self.pos[0] + self.size / 2 > gameSettings.screenWidth - 10 - gameSettings.playerWidth and self.isPlayerCollision(client) and math.cos(self.angle) > 0:
            impactToMid = ((self.pos[1] - client.pos) / (client.height * 0.5))
            self.angle = - (math.pi + (math.pi / 4) * impactToMid)
            self.speed *= 1.1
            if (self.speed > 2000):
                self.speed = 2000
    
    def wallCollision(self, gameSettings):
        if (self.pos[1] < self.size / 2  and math.sin(self.angle) < 0 or 
            self.pos[1] > gameSettings.screenHeight - self.size / 2 and math.sin(self.angle) > 0):
            self.angle = - self.angle

    def updatePoints(self, gameSettings, player1, player2):
        if self.pos[0] < 0:
            self.newPoint(gameSettings, player1, player2)
            return 1
        elif self.pos[0] > gameSettings.screenWidth:
            self.newPoint(gameSettings, player1, player2)
            return 0
        return -1

    def move(self, host, client, gameSettings, lastMoveTime):
        self.hostCollision(gameSettings, host)
        self.clientCollision(client, gameSettings)
        self.wallCollision(gameSettings)
        tmpTime = time.time_ns()
        diffTime = (tmpTime - lastMoveTime) / 1000000000
        self.pos[0] += math.cos(self.angle) * self.speed * diffTime
        self.pos[1] += math.sin(self.angle) * self.speed * diffTime
        return (self.updatePoints(gameSettings, host, client))
        