import time

class Player:
    def __init__(self, id, gameSettings):
        self.width = gameSettings.playerWidth
        self.height = gameSettings.playerHeight
        self.points = 0
        self.pos = gameSettings.screenHeight / 2
        self.up = False
        self.down = False
        self.id = id
    def move(self, gameSettings, lastMoveTime):
        mvt = self.down - self.up
        tmpTime = time.time_ns()
        diffTime = (tmpTime - lastMoveTime) / 1000000000
        newPos = self.pos + (mvt * gameSettings.screenHeight / 1.5) * diffTime
        if (newPos + gameSettings.playerHeight / 2 < gameSettings.screenHeight and newPos > gameSettings.playerHeight / 2):
            self.pos = newPos
