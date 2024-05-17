import math as m
import logging

# La balle est dans le repere de l'hote
class Ball:

    def __init__(self, gameSettings):
        self.pos = [gameSettings.screenWidth / 2, gameSettings.screenHeight / 2]
        self.speed = gameSettings.screenWidth / 1000
        self.angle = m.pi
        self.size = gameSettings.ballSize

    def newPoint(self, gameSettings, player1, player2):
        self.pos = [gameSettings.screenWidth / 2, gameSettings.screenHeight / 2]
        self.speed = gameSettings.screenWidth / 1000
        self.angle = m.pi
        self.size = gameSettings.ballSize
        player1.pos = gameSettings.screenHeight / 2
        player2.pos = gameSettings.screenHeight / 2
        logging.info("New point is starting")

    def isPlayerCollision(self, player):
        if self.pos[1] + self.size / 3 > player.pos - (player.height / 2) and self.pos[1] - self.size / 3 < player.pos + (player.height / 2):
            return True
        return False

    def hostCollision(self, host):
        if self.pos[0] <= self.size + host.width and self.isPlayerCollision(host):
            impactToMid = ((self.pos[1] - host.pos) / (host.height * 0.5))
            self.angle = (m.pi / 4) * impactToMid
            self.speed *= 1.1
            if self.speed > 20:
                self.speed = 20

    def clientCollision(self, client, gameSettings):
        if self.pos[0] >= gameSettings.screenWidth - (self.size + client.width) and self.isPlayerCollision(client):
            impactToMid = ((self.pos[1] - client.pos) / (client.height * 0.5))
            self.angle = - (m.pi + (m.pi / 4) * impactToMid)
            self.speed *= 1.1
            if (self.speed > 20):
                self.speed = 20
    
    def wallCollision(self, gameSettings):
        if self.pos[1] <= self.size / 2 or self.pos[1] >= gameSettings.screenHeight - self.size / 2:
            self.angle = - self.angle

    def updatePoints(self, gameSettings, player1, player2):
        if self.pos[0] < 0:
            self.newPoint(gameSettings, player1, player2)
            return 1
        elif self.pos[0] > gameSettings.screenWidth:
            self.newPoint(gameSettings, player1, player2)
            return 0
        return -1

    def move(self, host, client, gameSettings):
        self.hostCollision(host)
        self.clientCollision(client, gameSettings)
        self.wallCollision(gameSettings)
        self.pos[0] += m.cos(self.angle) * self.speed
        self.pos[1] += m.sin(self.angle) * self.speed
        return (self.updatePoints(gameSettings, host, client))
        