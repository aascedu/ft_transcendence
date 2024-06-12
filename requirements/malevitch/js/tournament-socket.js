async function init_tournament_socket(tournamentId) {
    const roomName = tournamentId;
    const domain = window.location.host;
    const token = await get_socket_connection_token('/coubertin/');
    const url = 'wss://' + domain + '/coubertin/tournament/ws/' + roomName + '/?token=' + token;
    const tournamentSocket = new WebSocket(url);

    tournamentSocket.onopen = function(event) {
        console.log("Tournament socket opened in the front");
    };

    tournamentSocket.onclose = function() {
        console.log("Tournament socket closed in the front");
    }

    tournamentSocket.onerror = function(event) {
        console.log("Socket error");
    }

    tournamentSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.Action === "startGame") {
            console.log("Debug: Game starting")
            showGamePage(data.RoomName);
			return ;
        }

        if (data.Action === "tournamentState") {
            let tournament = data.Tournament;
            // Mise a jour de l'affichage
			return ;
        }
    };
}

