async function get_socket_connection_token(path) {
    const response = await fetch_get(path + "connectionView/");
    return response.Key
}

async function init_session_socket() {
    unique_use_token = await get_socket_connection_token("/hermes/")
    console.log(unique_use_token)
    url = "wss://localhost:8000/hermes/session/" + g_userNick + "?token=" + unique_use_token
    console.log(url)
    const socket = new WebSocket(url)
    socket.onopen = function(event) {
        console.log("connection has occured")
    }

    socket.onmessage = function(event) {
        console.log(`Message du serveur : ${event.data}`)
        const data = JSON.parse(event.data);

        if (data.type === "new.friendship") {
            console.log("new.friendship");
            notificationNewFriendship(data);
            return ;
        }
        if (data.type === "new.friend.connected") {
            console.log("new.friend.connected");
            notificationNewClientConnected(data);
            return ;
        }
        if (data.type === "message") {
            notificationMessage(data);
            console.log("message");
            return ;
        }
        if (data.type === "friendship.request") {
            notificationFriendshipRequest(data);
            console.log("friendship.request");
            return ;
        }
        if (data.type === "game.request") {
            notificationGameRequest(data);
            console.log("game.request");
            return ;
        }
        if (data.type === "tournament.request") {
            notificationTournamentRequest(data);
            console.log("tournament.request");
            return ;
        }
        if (data.type === "game.accepted") {
            notificationGameAccepted(data);
            console.log("start.game");
            return ;
        }
    }
}


async function connect(id, password) {
		const response = await fetch('/petrus/auth/signin/youpi', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({Id: id, Pass: password,}),
		});
}

async function notificationNewFriendship(data) {
    console.log("new friendship")
}
async function notificationTournamentRequest(data) {
    console.log("new tournament request")
}
async function notificationGameAccepted(data) {
    console.log("game accepted")
}
async function notificationGameRequest(data) {
    console.log("game request")
}
async function notificationNewFriendship(data) {
    console.log("new friendship")
}
async function notificationNewClientConnected(data) {
    console.log("new friend connected")
}
async function notificationMessage(data) {
    console.log("new message")
}
