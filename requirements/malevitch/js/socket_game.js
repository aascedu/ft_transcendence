let gameArea = document.getElementById("test-target"),
htmlme = document.getElementById("me"),
htmlopponent = document.getElementById("opponent"),
htmlBall = document.getElementsByClassName("ball")[0];

const ballStyle = getComputedStyle(htmlBall);
const meStyle = getComputedStyle(htmlme);
const opponentStyle = getComputedStyle(htmlopponent);

var screenHeight = window.innerHeight;
var screenWidth = window.innerWidth;
var ratioHeight = screenHeight / 1080;
var ratioWidth = screenWidth / 1920;

htmlopponent.style.left = screenWidth - parseInt(opponentStyle.width, 10) - 10 + 'px';
htmlme.style.left = 10 + 'px';

var count = 0;

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
    move(playerStyle, htmlPlayer) {
        let mvt = this.down - this.up;
        const newPos = this.pos + (mvt * screenHeight / 100) / 2;
        if (newPos + parseInt(playerStyle.height, 10) / 2 < screenHeight && newPos > parseInt(playerStyle.height, 10) / 2) {
            this.pos = newPos;
            htmlPlayer.style.top = this.pos - parseInt(playerStyle.height, 10) / 2 + 'px';
        }
    }
}

class Ball {
    constructor() {
        this.pos = {x: screenWidth / 2, y: screenHeight / 2};
        this.speed = {x: 0, y: 0};
    }
    move(playerPos, playerStyle, opponentPos, opponentStyle, ballStyle) {
        var newPosX = this.pos['x'] + this.speed['x'];
        var newPosY = this.pos['y'] + this.speed['y'];
        if (newPosX - parseInt(ballStyle.height, 10) / 2 < 10 + parseInt(playerStyle.width, 10)) {
            if (this.pos['y'] > playerPos - parseInt(playerStyle.height, 10) / 2 &&
                this.pos['y'] < playerPos + parseInt(playerStyle.height, 10) / 2 &&
                this.speed['x'] < 0) {
                    this.speed['x'] *= -1.1;
                    newPosX = this.pos['x'] + this.speed['x'];
                }
        }
        else if (newPosX + parseInt(ballStyle.height, 10) / 2 > screenWidth - parseInt(opponentStyle.width, 10) - 10) {
            if (this.pos['y'] > opponentPos - parseInt(opponentStyle.height, 10) / 2 &&
                this.pos['y'] < opponentPos + parseInt(opponentStyle.height, 10) / 2 &&
                this.speed ['x'] > 0) {
                    this.speed['x'] *= -1.1;
                    newPosX = this.pos['x'] + this.speed['x'];
                }
        }
        else if (newPosY - parseInt(ballStyle.height, 10) / 2 < 0 && this.speed['y'] < 0 || newPosY + parseInt(ballStyle.height, 10) / 2 > screenHeight && this.speed['y'] > 0) {
            this.speed['y'] *= -1;
            newPosY = this.pos['y'] + this.speed['y'];
        }
        this.pos['x'] = newPosX;
        this.pos['y'] = newPosY;
        htmlBall.style.top = this.pos['y'] - parseInt(ballStyle.height, 10) / 2 + 'px';
        htmlBall.style.left = this.pos['x'] - parseInt(ballStyle.width, 10) / 2 + 'px';
        // console.log(this.speed['y']);
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
    // console.log(unique_use_token);
    const domain = window.location.host;
    const url = 'wss://' + domain + '/ludo/pong/ws/' + roomName + '/' + "?token=" + unique_use_token;
    const socket = new WebSocket(url); // Probably add room name
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
        sendStartGameData("gameStart"); // Player names maybe ?
        // if (me.isPlayer) {
        //     intervalId = setInterval(gameLoop, 33, shouldContinue);
        // }
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
            animationId = window.requestAnimationFrame(animate);
        }

        else if (data.type == "updateScore") {
            me.points = data.myScore;
            opponent.points = data.opponentScore;
            ball.init();
            htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
            htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';
            setTimeout(gameLoop, 1000);
        }

        else if (data.type == "myState") {
            me.pos = data.mePos / 100 * screenHeight;
            opponent.pos = data.opponentPos / 100 * screenHeight;
            htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
            htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';

            ball.speed['x'] = data.ballSpeedX * ratioWidth * 2;
            ball.speed['y'] = data.ballSpeedY * ratioHeight * 2;

            newPosX = data.ballPosX / 100 * screenWidth;
            newPosY = data.ballPosY / 100 * screenHeight;            
            ball.pos['x'] = newPosX;
            htmlBall.style.left = ball.pos['x'] - parseInt(ballStyle.width, 10) / 2 + 'px';
            ball.pos['y'] = data.ballPosY / 100 * screenHeight;
            htmlBall.style.top = ball.pos['y'] - parseInt(ballStyle.height, 10) / 2 + 'px';
            // if (Math.abs(newPosX - data.ballPosX) > Math.abs(ball.speed['x'])) {
            //     ball.pos['x'] = newPosX;
            //     htmlBall.style.left = ball.pos['x'] - parseInt(ballStyle.width, 10) / 2 + 'px';
            // }
            // if (Math.abs(newPosY - data.ballPosY) > Math.abs(ball.speed['y'])) {
            //     ball.pos['y'] = data.ballPosY / 100 * screenHeight;
            //     htmlBall.style.top = ball.pos['y'] - parseInt(ballStyle.height, 10) / 2 + 'px';
            // }


            me.points = data.myScore;
            opponent.points = data.opponentScore;
            document.getElementById("score1").innerHTML = me.points.toString();
            document.getElementById("score2").innerHTML = opponent.points.toString();
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

// Updtae position de la balle et du joueur !
    function updateScreenSize() {
        // console.log(screenHeight);
        screenHeight = window.innerHeight;
        screenWidth = window.innerWidth;
        ratioHeight = screenHeight / 1080;
        ratioWidth = screenWidth / 1920;
        ratioBall = Math.max(ratioHeight, ratioWidth);
        htmlme.style.height = 200 * ratioHeight + 'px';
        htmlopponent.style.height = 200 * ratioHeight + 'px';
        htmlme.style.width = 24 * ratioWidth + 'px';
        htmlopponent.style.width = 24 * ratioWidth + 'px';
        htmlBall.style.height = 24 * ratioBall + 'px';
        htmlBall.style.width = 24 * ratioBall + 'px';
        htmlopponent.style.left = screenWidth - parseInt(opponentStyle.width, 10) - 10 + 'px';  
    }

    window.addEventListener('resize', updateScreenSize());
    window.onresize = updateScreenSize;
    htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
    htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';

    function gameLoop(shouldContinue) {

        // Update positions
        frames[i] = {"meUp": me.up, "meDown": me.down};

        // Send info to back
        if (i % nbframes == 0) {
            sendData("gameState", frames, shouldContinue);
            frames = {};
        }

        i++;
    }

    function animate() {
        // me.move(meStyle, htmlme);
        // opponent.move(opponentStyle, htmlopponent);
        // console.log(ball.speed['x']);
        // gameLoop(shouldContinue);
        // ball.move(me.pos, meStyle, opponent.pos, opponentStyle, ballStyle);
        // animationId = window.requestAnimationFrame(animate);
    }
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
