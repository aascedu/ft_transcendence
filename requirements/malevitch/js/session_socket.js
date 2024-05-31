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

        if (data.type === "notification.new.friendship") {
            notificationNewFriendship(data);
            return
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
    console.log(data);
}
