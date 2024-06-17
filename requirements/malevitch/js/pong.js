let gameArea = document.getElementById("test-target"),
htmlme = document.getElementById("me"),
htmlopponent = document.getElementById("opponent"),
htmlBall = document.getElementsByClassName("ball")[0];

const ballStyle = getComputedStyle(htmlBall);
const meStyle = getComputedStyle(htmlme);
const opponentStyle = getComputedStyle(htmlopponent);

const tmpScreenHeight = window.innerHeight;
const tmpScreenWidth = window.innerWidth;

htmlopponent.style.left = tmpScreenWidth - parseInt(opponentStyle.width, 10) - 10 + 'px';
htmlme.style.left = 10 + 'px';

/***************************************** Classes *****************************************/

class Player {
    constructor(name) {
        this.name = name;
        this.points = 0;
        this.pos = tmpScreenHeight / 2;
        this.up = false;
        this.down = false;
        this.isPlayer = true;
    }
    move(playerStyle) {
        let mvt = this.down - this.up;
        const newPos = this.pos + (mvt * tmpScreenHeight / 100) / 2;
        if (newPos + parseInt(playerStyle.height, 10) / 2 < tmpScreenHeight && newPos > parseInt(playerStyle.height, 10) / 2) {
            this.pos = newPos;
        }
    }
}

class Ball {
    constructor() {
        this.prevpos = {x: tmpScreenWidth / 2, y: tmpScreenHeight / 2};
        this.backpos = {x: tmpScreenWidth / 2, y: tmpScreenHeight / 2};
        this.pos = {x: tmpScreenWidth / 2, y: tmpScreenHeight / 2};
        this.speed = {x: 0, y: 0};
        this.size = 0;
    }
    move() {
        this.pos['x'] += this.speed['x'];
        this.pos['y'] += this.speed['y'];
    }
    init() {
        this.backpos = {x: tmpScreenWidth / 2, y: tmpScreenHeight / 2};
        this.prevpos = {x: tmpScreenWidth / 2, y: tmpScreenHeight / 2};
        this.pos = {x: tmpScreenWidth / 2, y: tmpScreenHeight / 2};
        this.speed['x'] = 0;
        this.speed['y'] = 0;
    }
}

/***************************************** Players movements *****************************************/

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
    const socket = new WebSocket(url); // Probably add room name
    console.log(url);
    var intervalId;
    var shouldContinue = true;

    let ball = new Ball();
    let i = 1;
    let frames = {};
    let nbframes = 1;

    socket.onopen = function(event) {
        console.log("Socket opened in the front");
        sendStartGameData("gameStart"); // Player names maybe ?
        if (me.isPlayer) {
            intervalId = setInterval(gameLoop, 33, shouldContinue);
        }
    };

    socket.onclose = function() {
        shouldContinue = false;
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
            ball.prevpos['x'] = tmpScreenWidth / 2;
            ball.prevpos['y'] = tmpScreenHeight / 2;
            ball.backpos['x'] = tmpScreenWidth / 2;
            ball.backpos['y'] = tmpScreenHeight / 2;            
            ball.pos['x'] = tmpScreenWidth / 2;
            ball.pos['y'] = tmpScreenHeight / 2;
            htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
            htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';
            setTimeout(gameLoop, 1000);
        }

        else if (data.type == "myState" || data.type == "opponentState") {
            if (data.type == "myState") {
                me.pos = data.mePos / 100 * tmpScreenHeight;
            } else {
                opponent.pos = data.opponentPos / 100 * tmpScreenHeight;
            }
            ball.prevpos['x'] = ball.backpos['x'];
            ball.prevpos['y'] = ball.backpos['y'];
            ball.pos['x'] = data.ballPosX / 100 * tmpScreenWidth;
            ball.backpos['x'] = data.ballPosX / 100 * tmpScreenWidth;
            ball.pos['y'] = data.ballPosY / 100 * tmpScreenHeight;
            ball.backpos['y'] = data.ballPosY / 100 * tmpScreenHeight;
            ball.speed['x'] = ball.backpos['x'] - ball.prevpos['x'];
            ball.speed['y'] = ball.backpos['y'] - ball.prevpos['y'];
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
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        const ratioHeight = screenHeight / 1080;
        const ratioWidth = screenWidth / 1920;
        const ratioBall = Math.min(ratioHeight, ratioWidth);
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

        console.log("GameLoop");

        // Update score
        document.getElementById("score1").innerHTML = me.points.toString();
        document.getElementById("score2").innerHTML = opponent.points.toString();

        // Update positions
        frames[i] = {"meUp": me.up, "meDown": me.down};

        // Send info to back
        if (i % nbframes == 0) {
            sendData("gameState", frames, shouldContinue);
            frames = {};
        }

        // Update front
        htmlBall.style.top = ball.pos['y'] - parseInt(ballStyle.height, 10) / 2 + 'px';
        htmlBall.style.left = ball.pos['x'] - parseInt(ballStyle.width, 10) / 2 + 'px';
        htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
        htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';

        i++;
    }

    let stop = false

    function animate() {
        me.move(meStyle);
        opponent.move(opponentStyle);
        ball.move();
        htmlBall.style.top = ball.pos['y'] - parseInt(ballStyle.height, 10) / 2 + 'px';
        htmlBall.style.left = ball.pos['x'] - parseInt(ballStyle.width, 10) / 2 + 'px';
        htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
        htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';
        window.requestAnimationFrame(animate)
    }
    window.requestAnimationFrame(animate)
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
