async function init_matchmaking_socket(requester, invited) {
    if (g_matchmakingSocket) {
        return ;
    }

    token = await get_socket_connection_token("/cupidon/")
    const domain = window.location.host;
    const url = 'wss://' + domain + '/cupidon/matchmaking/ws/' + requester + '/' + invited + '/?token=' + token
    g_matchmakingSocket = new WebSocket(url);
    var intervalId;

    g_matchmakingSocket.onopen = function(event) {
        console.log("Matchmaking socket opened in the front");
        intervalId = setInterval(ping, 10000);
    };

    g_matchmakingSocket.onclose = function() {
        console.log("Matchmaking socket closed in the front");
        g_matchmakingSocket = null;
    }

    g_matchmakingSocket.onerror = function(event) {
        console.log("Socket error");
    }

    g_matchmakingSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "start.game") {
            clearInterval(intervalId);
            showGamePage(data.RoomName);
            g_matchmakingSocket.close()
        }
    };

    function sendData(type) {
        const data = {
            type: type,
        };

        g_matchmakingSocket.send(JSON.stringify(data));
    }

    function ping() {
        if (requester === 0 && invited === 0){
            sendData('Ping');
        }
    }
}

