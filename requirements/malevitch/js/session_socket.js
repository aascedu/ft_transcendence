async function get_socket_connection_token(path) {
    try {
        console.log("damned")
        const response = await fetch(path + "connectionView/");

        const result = await response.json();
        if ('Err' in result) {
            console.log("une erreure a occured")
            console.log(result.Err);

        } else {
            console.log("no mistake")
            const unique_use_token = result.Key
        }
        return await result.Key
    }
    catch (error) {
        console.error("Error:", error);
    }
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
    }
}

async function add_friend(id) {
	fetch('/alfred/user/friends/' + id,
        {
            method: 'POST'

        }
    )
		.then (response => {
			if (!response.ok) {
				throw new Error('HTTP error: ' + response.status);
			}
			return response.json();
		})
		.then (data => {
            console.log(data)
		})
		.catch (error => {
			console.error('Fetch problem:', error.message);
		});
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
