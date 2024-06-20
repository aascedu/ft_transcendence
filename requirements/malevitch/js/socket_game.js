let gameArea = document.getElementById("test-target"),
htmlme = document.getElementById("me"),
htmlopponent = document.getElementById("opponent"),
htmlBall = document.getElementsByClassName("ball")[0];

const ballStyle = getComputedStyle(htmlBall);
const meStyle = getComputedStyle(htmlme);
const opponentStyle = getComputedStyle(htmlopponent);

var screenHeight = window.innerHeight;
var screenWidth = window.innerWidth;

htmlopponent.style.left = screenWidth - parseInt(opponentStyle.width, 10) - 10 + 'px';
htmlme.style.left = 10 + 'px';

/***************************************** Classes *****************************************/

class Player {
    constructor(name) {
        this.name = name;
        this.points = 0;
        this.pos = screenHeight / 2;
        this.up = false;
        this.down = false;
        this.isPlayer = true;
    }
    move(playerStyle) {
        let mvt = this.down - this.up;
        const newPos = this.pos + (mvt * screenHeight / 100) / 2;
        if (newPos + parseInt(playerStyle.height, 10) / 2 < screenHeight && newPos > parseInt(playerStyle.height, 10) / 2) {
            this.pos = newPos;
        }
    }
}

class Ball {
    constructor() {
        this.pos = {x: screenWidth / 2, y: screenHeight / 2};
        this.speed = {x: 0, y: 0};
        this.size = 0;
    }
    move(playerPos, playerStyle, opponentPos, opponentStyle, ballStyle) {
        var newPosX = this.pos['x'] + this.speed['x'];
        var newPosY = this.pos['y'] + this.speed['y'];
        if (newPosX - parseInt(ballStyle.height, 10) < 10 + parseInt(playerStyle.width, 10)) {
            if (this.pos['y'] > playerPos - parseInt(playerStyle.height, 10) / 2 &&
                this.pos['y'] < playerPos + parseInt(playerStyle.height, 10) / 2 &&
                this.speed['x'] < 0) {
                    newPosX = this.pos['x'] - this.speed['x'];
                    this.speed['x'] *= -1;
                }
        }
        else if (newPosX + parseInt(ballStyle.height, 10) > screenWidth - parseInt(opponentStyle.width, 10) - 10) {
            if (this.pos['y'] > opponentPos - parseInt(opponentStyle.height, 10) / 2 &&
                this.pos['y'] < opponentPos + parseInt(opponentStyle.height, 10) / 2 &&
                this.speed['x'] > 0) {
                    newPosX = this.pos['x'] - this.speed['x'];
                    this.speed['x'] *= -1;
                }
        }
        if (newPosY + parseInt(ballStyle.height, 10) > screenHeight ||
            newPosY - parseInt(ballStyle.height) < 0) {
                this.speed['y'] *= -1
            }
        this.pos['x'] = newPosX;
        this.pos['y'] = newPosY;
    }
    init() {
        this.pos = {x: screenWidth / 2, y: screenHeight / 2};
        this.speed['x'] = 0;
        this.speed['y'] = 0;
    }
}

/***************************************** Websocket events *****************************************/

let me = new Player("me");
let opponent = new Player("opponent");

// Events for keyboard inputs
window.addEventListener("keydown", function(e) { // Booleans with on press and on release (anyway will be a websocket) !!
	if (e.repeat || me.isPlayer === false) {
        return;
    }
    if (`${e.key}` === 'w' || `${e.key}` === 'ArrowUp') {
        me.up = true;
    } else if (`${e.key}` === 's' || `${e.key}` === 'ArrowDown') {
        me.down = true;
    }
});

window.addEventListener("keyup", (e) => { // Booleans with on press and on release (anyway will be a websocket) !!
    if (me.isPlayer === false) {
        return;
    }
    if (`${e.key}` === 'w' || `${e.key}` === 'ArrowUp') {
        me.up = false;
    } else if (`${e.key}` === 's' || `${e.key}` === 'ArrowDown') {
        me.down = false;
    }
});

/***************************************** Websockets *****************************************/

async function init_game_socket(roomName) {
    unique_use_token = await get_socket_connection_token('/ludo/');
    console.log(unique_use_token);
    const domain = window.location.host;
    const url = 'wss://' + domain + '/ludo/pong/ws/' + roomName + '/' + "?token=" + unique_use_token;
    const socket = new WebSocket(url);
    console.log(url);
    var intervalId;
    var animationId;
    var shouldContinue = true;

    let ball = new Ball();
    let i = 1;
    let frames = {};
    let nbframes = 1;

    socket.onopen = function(event) {
        console.log("Socket opened in the front");
        sendStartGameData("gameStart");
        if (me.isPlayer) {
            intervalId = setInterval(gameLoop, 500, shouldContinue);
        }
    };

    socket.onclose = function() {
        shouldContinue = false;
        cancelAnimationFrame(animationId);
        clearInterval(intervalId);
        console.log("Socket closed in the front");
    }

    socket.onerror = function(event) {
        console.log("Socket error");
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type == "youWin" || data.type == "youLose") {
            shouldContinue = false;
            cancelAnimationFrame(animationId);
            clearInterval(intervalId);
            console.log(data.type);
            victoryDefeatScreen(data);
            socket.close();
        }

        else if (data.type == "gameParameters") {
            // Actual objects
            me.isPlayer = data.isPlayer;
            console.log("gameStart response");
        }

        else if (data.type == "updateScore") {
            me.points = data.myScore;
            opponent.points = data.opponentScore;
            ball.init();
            htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
            htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';
            setTimeout(gameLoop, 1000);
        }

        else if (data.type == "myState" || data.type == "opponentState") {
            if (data.type == "myState") {
                me.pos = data.mePos / 100 * screenHeight;
            } else {
                opponent.pos = data.opponentPos / 100 * screenHeight;
            }
            ball.pos['x'] = data.ballPosX / 100 * screenWidth;
            ball.pos['y'] = data.ballPosY / 100 * screenHeight;
            ball.speed['x'] = data.ballSpeedX / 15;
            ball.speed['y'] = data.ballSpeedY / 15;
            me.points = data.myScore;
            opponent.points = data.opponentScore;
        }
    };
    function sendStartGameData(type) {
        // Construct a msg object containing the data the server needs to process the message from the chat client.
        const gameData = {
          type: type,
        };

        // Send the msg object as a JSON-formatted string.
        socket.send(JSON.stringify(gameData));
    }

    function sendData(type, frames, shouldContinue) {
        if (!shouldContinue) {
            return ;
        }

        const gameData = {
          type: type,
          frames: frames,
        };
        socket.send(JSON.stringify(gameData));
    }
/***************************************** Game logic *****************************************/

    function updateScreenSize() {
        screenHeight = window.innerHeight;
        screenWidth = window.innerWidth;
        ratioHeight = screenHeight / 1080;
        ratioWidth = screenWidth / 1920;
        ratioBall = Math.min(ratioHeight, ratioWidth);
        htmlme.style.height = 200 * ratioHeight + 'px';
        htmlopponent.style.height = 200 * ratioHeight + 'px';
        htmlme.style.width = 24 * ratioWidth + 'px';
        htmlopponent.style.width = 24 * ratioWidth + 'px';
        htmlBall.style.height = 36 * ratioBall + 'px';
        htmlBall.style.width = 36 * ratioBall + 'px';
        htmlopponent.style.left = screenWidth - parseInt(opponentStyle.width, 10) - 10 + 'px';
    }

    window.addEventListener('resize', updateScreenSize());
    window.onresize = updateScreenSize;
    htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
    htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';

    function gameLoop(shouldContinue) {

        // Update score
        document.getElementById("score1").innerHTML = me.points.toString();
        document.getElementById("score2").innerHTML = opponent.points.toString();

        // Update positions
        frames[0] = {"meUp": me.up, "meDown": me.down};

        // Send info to back
        
        sendData("gameState", frames, shouldContinue);
        frames = {};

        // Update front
        htmlBall.style.top = ball.pos['y'] - parseInt(ballStyle.height, 10) / 2 + 'px';
        htmlBall.style.left = ball.pos['x'] - parseInt(ballStyle.width, 10) / 2 + 'px';
        htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
        htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';

    }

    function animate() {
        me.move(meStyle);
        opponent.move(opponentStyle);
        ball.move(me.pos, meStyle, opponent.pos, opponentStyle, ballStyle);
        htmlBall.style.top = ball.pos['y'] - parseInt(ballStyle.height, 10) / 2 + 'px';
        htmlBall.style.left = ball.pos['x'] - parseInt(ballStyle.width, 10) / 2 + 'px';
        htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
        htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';
        animationId = window.requestAnimationFrame(animate);
    }
    animationId = window.requestAnimationFrame(animate);
}

function showGamePage(roomName) {
    var	homepageHeader = document.querySelector('.homepage-header');
	homepageHeader.classList.add('visually-hidden');

	var	homepagePicture = document.querySelector('.homepage-game-picture');
	homepagePicture.classList.add('visually-hidden');

	hideEveryPage();

	init_game_socket(roomName);
	g_state.pageToDisplay = '.game';
	window.history.pushState(g_state, null, "");
	render(g_state);
}
