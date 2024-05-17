const userName = "pierrepierrepierre"
const url = 'wss://localhost:8000/hermes/session/' + userName + '/'
const notificationSocket = new WebSocket(url); // Probably add room name

notificationSocket.onopen = function(event) {
    console.log("Hermes socket opened in the front");
};

notificationSocket.onclose = function() {
    console.log("Socket closed in the front");
}

notificationSocket.onerror = function(event) {
    console.log("Socket error");
}

notificationSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "notification.message") {
        msg = data.message;
        // Faire pop la notif
    }

    if (data.type === "start.game") {
        roomName = toString(data.player1) + '-' + toString(data.player2) + '/';
        init_socket(roomName);
        // Cacher ce qu'il faut pour lancer la game
    }

};
