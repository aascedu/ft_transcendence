async function init_matchmaking_socket(requester, invited) {
    token = await get_socket_connection_token("/cupidon/")
    const matchmakingSocket = new WebSocket('/cupidon/matchmaking/ws/' + requester + '/' + invited + '/?token=' + token);
    const Id = g_userId;

    matchmakingSocket.onopen = function(event) {
        console.log("Matchmaking socket opened in the front");
    };

    matchmakingSocket.onclose = function() {
        console.log("Matchmaking socket closed in the front");
        sendData("Leaving"); // ?
    }

    matchmakingSocket.onerror = function(event) {
        console.log("Socket error");
    }

    matchmakingSocket.onmessage = (event) => {
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

        matchmakingSocket.send(JSON.stringify(data));
    }

    function ping() {
        console.log("This is ping");
        if (requester === 0 && invited === 0){
            console.log("I'm sending the ping");
            sendData('Ping');
        }
    }

    matchmakingSocket.addEventListener('open', (event) => {
        setInterval(ping, 10000); // Juste envoyer sendData('ping') ?
    });
}

