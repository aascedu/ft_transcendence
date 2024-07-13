async function init_matchmaking_socket(requester, invited) {
    if (g_matchmakingSocket) {
        return ;
    }

    try {
        token = await get_socket_connection_token("/cupidon/")
        const domain = window.location.host;
        const url = 'wss://' + domain + '/cupidon/matchmaking/ws/' + requester + '/' + invited + '/?token=' + token
        g_matchmakingSocket = new WebSocket(url);
    } catch (error) {
        console.error(error);
        return ;
    }

    var intervalId;
    g_matchmakingSocket.onopen = function(event) {
        console.log('Matchmaking socket opened');
        intervalId = setInterval(ping, 5000);
    };

    g_matchmakingSocket.onclose = function() {
        console.log('Matchmaking socket closed');
        g_matchmakingSocket = null;
		document.querySelector('.notif-search-match').classList.add('visually-hidden');
		setAriaHidden();
		cancelSearchMatch();
    }
    
    g_matchmakingSocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "start.game") {
            // "Match found" notif
			clearTimeout(g_gameInviteTimer);
            clearInterval(intervalId);
			var	opponent = data.RoomName;
			opponent = opponent.split('-');
			if (opponent[0] == g_userId) {
				opponent = opponent[1];
			}
			else {
				opponent = opponent[0];
			}
			await matchFound(opponent);
            showGamePage(data.RoomName);
            g_matchmakingSocket.close();
        }
		if (data.type === "game.refused") {
			clearTimeout(g_gameInviteTimer);
		
			if (g_state.pageToDisplay == '.game') {
				return ;
			}

			// If we are creating a tournament, display friend if they are available again
			if (g_state.pageToDisplay == '.create-tournament') {
				clearCreateTournamentAvailableFriends();
				await createTournamentLoadAvailableFriends();
			}
			// If we are looking to invite the friend to a tournament, display friend if they are available again
			if (g_state.pageToDisplay == '.tournament-info') {
				clearTournamentInfoInvites();
				await loadTournamentInfoInvites();
			}
			// Load back header to display friend as available back to play with them
			clearHomepageHeader();
			await loadHomepageHeader();
		}
    };

    function sendData(type) {
        const data = {
            type: type,
        };
		if (g_matchmakingSocket == null) {
			return ;
		}

        g_matchmakingSocket.send(JSON.stringify(data));
    }

    function ping() {
        if (requester === 0 && invited === 0){
            sendData('Ping');
        }
    }
}

