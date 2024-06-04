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
        const data = event.data;

        obj = JSON.parse(data);

        if (obj.type === "notification.new.friendship") {
            notificationNewFriendship(obj);
            return ;
        }
        if (obj.type === "notification.new.friend.connected") {
            notificationNewClientConnected(obj);
            return ;
        }
        if (obj.type === "notification.message") {
            notificationMessage(obj);
            return ;
        }
        if (obj.type === "notification.friendship.request") {
            notificationFriendshipRequest(obj);
            return ;
        }
        if (obj.type === "notification.game.request") {
            notificationGameRequest(obj);
            return ;
        }
        if (obj.type === "notification.tournament.request") {
            notificationTournamentRequest(obj);
            return ;
        }
        if (obj.type === "notification.game.accepted") {
            notificationGameAccepted(obj);
            return ;
        }
    }
}


async function connect(id, password, nickname) {
    const response = await fetch_post(add_petrus_in_url(nickname), {Id: id, Pass: password,});
    return response
}

async function notificationFriendshipRequest(data) {
    console.log('FriendshipRequest');
    console.log(data)
}

async function notificationNewFriendship(data) {
    console.log('NewFriendship');
    console.log(data);
}
async function notificationTournamentRequest(data) {
    console.log('TournamentRequest');
    console.log(data);
}
async function notificationGameAccepted(data) {
    console.log("game accepted");
    console.log(data);
}
async function notificationGameRequest(data) {
    console.log("game request");
    console.log(data);
}
async function notificationNewClientConnected(data) {
    console.log("new friend connected");
    console.log(data);
}
async function notificationMessage(data) {
    console.log("new message");
    console.log(data);
}
