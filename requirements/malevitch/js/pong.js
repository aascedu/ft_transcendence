let gameArea = document.getElementById("test-target"),
htmlme = document.getElementById("me"),
htmlopponent = document.getElementById("opponent"),
htmlBall = document.getElementsByClassName("ball")[0];

const ballStyle = getComputedStyle(htmlBall);
const meStyle = getComputedStyle(htmlme);
const opponentStyle = getComputedStyle(htmlopponent);

const tmpScreenHeight = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
const tmpScreenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
ratio1 = tmpScreenHeight / 1080;
ratio2 = tmpScreenWidth / 1920;
const ratio = Math.min(ratio1, ratio2);

var screenHeight = tmpScreenHeight;
var screenWidth = tmpScreenWidth;
if (ratio == ratio1) {
    screenHeight = tmpScreenHeight;
    screenWidth = screenHeight * 1920 / 1080;
} else {
    screenWidth = tmpScreenWidth;
    screenHeight = screenWidth * 1080 / 1920;
}

console.log("tmpScreenHeight is: " + tmpScreenHeight.toString());
console.log("tmpScreenWidth is: " + tmpScreenWidth.toString());
console.log("screenHeight is: " + screenHeight.toString());
console.log("screenWidth is: " + screenWidth.toString());

htmlopponent.style.left = screenWidth - parseInt(meStyle.width, 10) - 10 + 'px';

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
        const newPos = this.pos + mvt * screenHeight / 300;
        if (newPos + parseInt(playerStyle.height, 10) / 2 < screenHeight && newPos > parseInt(playerStyle.height, 10) / 2) {
            this.pos = newPos;
        }
    }
}

class Ball {
    constructor() {
        this.pos = {x: screenWidth / 2, y: screenHeight / 2};
        this.speedStart = 0; // Non !
        this.speed = 0;
        this.angle = Math.PI;
        this.size = 0; // Non !
    }
    move() {
        this.pos['x'] += this.speed * Math.cos(this.angle);
        this.pos['y'] -= this.speed * Math.sin(this.angle);
    }
    init() {
        this.pos = {x: screenWidth / 2, y: screenHeight / 2};
        this.speed = this.speedStart; // Non !
        this.angle = Math.PI;
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
    if (`${e.key}` === 'w') {
        me.up = true;
    } else if (`${e.key}` === 's') {
        me.down = true;
    }
});

window.addEventListener("keyup", (e) => { // Booleans with on press and on release (anyway will be a websocket) !!
    if (me.isPlayer === false) {
        return;
    }
    if (`${e.key}` === 'w') {
        me.up = false;
    } else if (`${e.key}` === 's') {
        me.down = false;
    }
});

/***************************************** Websockets *****************************************/

const roomName = "aaa";
const id = 0;
console.log(roomName);

async function get_unique_use_token() {
    try {
        console.log("damned");
        const response = await fetch("/ludo/pong/connectionView/");

        const result = await response.json();
        if ('Err' in result) {
            console.log("une erreure a occured");
            console.log(result.Err);

        } else {
            console.log("no mistake");
            const unique_use_token = result.Key;
        }
        return await result.Key;
    }
    catch (error) {
        console.error("Error:", error);
    }
}

async function init_socket() {
    unique_use_token = await get_unique_use_token();
    console.log(unique_use_token);
    url = 'wss://localhost:8000/ludo/pong/ws/' + roomName + '/' + "?token=" + unique_use_token;
    const socket = new WebSocket(url); // Probably add room name
    console.log(url);
    socket.onopen = function(event) {
        console.log("Socket opened in the front");
        sendStartGameData("gameStart"); // Player names maybe ?
    };

    socket.onclose = function() {
        console.log("Socket closed in the front");
    }

    socket.onerror = function(event) {
        console.log("Socket error");
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type == "youWin" || data.type == "youLose") {
            console.log(data.type); // Sleep pour faire pop une fenetre ?
            window.location.href = "https://localhost:8000/";
        }

        else if (data.type == "gameParameters") {
            // Display
            // htmlme.style.height = data.playerHeight * ratio + 'px';
            // htmlopponent.style.height = data.playerHeight * ratio + 'px';
            // htmlme.style.width = data.playerWidth * ratio + 'px';
            // htmlopponent.style.width = data.playerWidth * ratio + 'px';
            // htmlBall.style.height = data.ballSize * ratio + 'px';
            // htmlBall.style.width = data.ballSize * ratio + 'px';

            // Actual objects
            ball.size = data.ballSize * ratio;
            ball.speedStart = data.ballSpeed * ratio;
            ball.speed = ball.speedStart;
            me.isPlayer = data.isPlayer;

            console.log("gameStart response");
        }

        else if (data.type == "updateScore") {
            me.points = data.myScore;
            opponent.points = data.opponentScore;
        }

        if (data.type == "myState" || data.type == "opponentState") {
            if (data.type == "myState") {
                me.pos = data.mePos * ratio;
            } else {
                opponent.pos = data.opponentPos * ratio;
            }
            // console.log("Pos of ball before back return: x=" + ball.pos['x'].toString() + " y=" + ball.pos['y'].toString());
            ball.pos['x'] = data.ballPosX * ratio;
            ball.pos['y'] = data.ballPosY * ratio;
            ball.speed = data.ballSpeed * ratio;
            ball.angle = data.ballAngle * ratio;
            // Ajouter vitesse et angle de la balle.
            // console.log("Pos of ball after back return: x=" + ball.pos['x'].toString() + " y=" + ball.pos['y'].toString());
        }
    };
    function sendStartGameData(type) {
        // Construct a msg object containing the data the server needs to process the message from the chat client.
        const gameData = {
          type: type,
          id: id,
        };

        // Send the msg object as a JSON-formatted string.
        socket.send(JSON.stringify(gameData));
    }

    function sendData(type, frames) {
        const gameData = {
          type: type,
          frames: frames,
        };

        socket.send(JSON.stringify(gameData));
    }
    /***************************************** Game logic *****************************************/

    function isPlayerCollision(ball, player, playerStyle) {
        if (ball.pos['y'] > player.pos - (parseInt(playerStyle.height, 10) / 2) &&
            ball.pos['y'] < player.pos + (parseInt(playerStyle.height, 10) / 2)) {
            return true;
        }
        return false;
    }

    function playerCollision(ball, player, playerStyle) {
        let impactToMid = (ball.pos['y'] - player.pos) / (parseInt(playerStyle.height, 10) * 0.5); // > 0 quand la balle tape en DESSOUS du milieu
        if (player.name === "me") {
            ball.angle = - (Math.PI / 4) * impactToMid;
        } else if (player.name === "opponent") {
            ball.angle = Math.PI + (Math.PI / 4) * impactToMid;
        }
        ball.speed *= 1.1;
    }

    function normAngle(angle) {
        if (angle > Math.PI) {
            angle -= 2 * Math.PI;
        } else if (angle < - Math.PI) {
            angle += 2 * Math.PI;
        }
        // return angle;
    }

    let ball = new Ball();
    let i = 1;
    let frames = {};
    let nbframes = 1;

    function gameLoop() {
        // End of point
        if (ball.pos['x'] > screenWidth) {
            me.points++;
            ball.init();
        } else if (ball.pos['x'] < 0) {
            opponent.points++;
            ball.init();
        }

        // Update score
        document.getElementById("score1").innerHTML = me.points.toString();
        document.getElementById("score2").innerHTML = opponent.points.toString();

        // Update positions
        // ball.move();
        // me.move(meStyle);
        frames[i] = {"meUp": me.up, "meDown": me.down};

        // Send info to back
        // sendData("gameState", me.up, me.down);
        if (i % nbframes == 0) {
            console.log("Data sent to back");
            sendData("gameState", frames);
            frames = {};
        }

        // Update front
        htmlBall.style.top = ball.pos['y'] - parseInt(ballStyle.height, 10) / 2 + 'px';
        htmlBall.style.left = ball.pos['x'] - parseInt(ballStyle.width, 10) / 2 + 'px';
        htmlme.style.top = me.pos - parseInt(meStyle.height, 10) / 2 + 'px';
        htmlopponent.style.top = opponent.pos - parseInt(opponentStyle.height, 10) / 2 + 'px';

        // Collision with opponent
        if (ball.pos['x'] >= screenWidth - (parseInt(ballStyle.width, 10) + parseInt(opponentStyle.width, 10)) && isPlayerCollision(ball, opponent, opponentStyle)) {
            playerCollision(ball, opponent, opponentStyle);
        }

        // Collision with me
        if (ball.pos['x'] <= parseInt(ballStyle.width, 10) + parseInt(meStyle.width, 10) && isPlayerCollision(ball, me, meStyle)) {
            playerCollision(ball, me, meStyle);
        }

        // Collision with walls
        if (ball.pos['y'] <= parseInt(ballStyle.height, 10) / 2 || ball.pos['y'] >= screenHeight - parseInt(ballStyle.height, 10) / 2) {
            ball.angle = - ball.angle;
        }
        i++;
    }

    // Execute gameLoop every x ms
    if (me.isPlayer) {
            socket.addEventListener('open', (event) => {
                const intervalID = setInterval(gameLoop, 10);
            });
}

// requestAnimationFrame()

}

init_socket();