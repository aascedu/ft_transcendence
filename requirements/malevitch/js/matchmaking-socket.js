async function init_matchmaking_socket(requester, invited) {
    token = await get_socket_connection_token("/cupidon/")
    const exampleSocket = new WebSocket('wss://localhost:8000/cupidon/matchmaking/ws/' + requester + '/' + invited + '/?token=' + token);
    const Id = g_userId;

    exampleSocket.onopen = function(event) {
        console.log("Matchmaking socket opened in the front");
    };

    exampleSocket.onclose = function() {
        console.log("Matchmaking socket closed in the front");
        sendData("Leaving");
    }

    exampleSocket.onerror = function(event) {
        console.log("Socket error");
    }

    exampleSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "start.game") {
            console.log("Starting game");
            showGamePage(data.RoomName);
        }
    };

    function sendData(type) {
        const data = {
            type: type,
        };

        exampleSocket.send(JSON.stringify(data));
    }

    function ping() {
        if (requester === 0 && invited === 0){
            sendData('ping');
        }
    }

    exampleSocket.addEventListener('open', (event) => {
        const intervalID = setInterval(ping, 10000); // Juste envoyer sendData('ping') ?
    });
}

