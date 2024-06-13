async function init_tournament_socket(tournamentId) {
	if (g_tournamentSocket) {
		return ;
	}

    const roomName = tournamentId;
    const domain = window.location.host;
    const token = await get_socket_connection_token('/coubertin/');
    const url = 'wss://' + domain + '/coubertin/tournament/ws/' + roomName + '/?token=' + token;
    g_tournamentSocket = new WebSocket(url);

    g_tournamentSocket.onopen = function(event) {
        console.log("Tournament socket opened in the front");
    };

    g_tournamentSocket.onclose = function() {
        console.log("Tournament socket closed in the front");
		g_tournamentSocket = null;
    }

    g_tournamentSocket.onerror = function(event) {
        console.log("Socket error");
    }

    g_tournamentSocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.Action === "startGame") {
            console.log("Debug: Game starting")
            showGamePage(data.RoomName);
			return ;
        }

        if (data.Action === "tournamentState") {
            let tournament = data.Tournament;
			// Mise a jour de l'affichage
			var	tournamentId;
			// load back tournament info in case changes happened on the tournament we're looking at // also updates available friends
			if (g_state.pageToDisplay == '.tournament-info') {
				tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');
				await loadOngoingTournament(tournamentId);
			}
			// load back my tournaments in case a tournament has changed its name
			if (g_state.pageToDisplay == '.my-tournaments') {
				var	ongoingTournaments;

				try {
					ongoingTournaments = await get_my_tournaments();
					ongoingTournaments = ongoingTournaments.Ongoing;
				} catch (error) {
					console.error(error);
					return ;
				}

				for (i = 0; i < ongoingTournaments.length; i++) {
					tournamentId = ongoingTournaments[i].Id;
					if (tournamentId == tournament.Id) {
						clearMyTournaments();
						await loadMyTournaments();
					}
				}
			}
			// load back available tournaments in case a tournament has changed its name
			if (g_state.pageToDisplay == '.available-tournaments') {
				var	availableTournaments;

				try {
					availableTournaments = await get_tournaments_available();
				} catch (error) {
					console.error(error);
					return ;
				}

				Object.entries(availableTournaments).forEach(async ([key, value]) => {
					if (key == tournament.Id) {
						clearAvailableTournaments();
						await loadAvailableTournaments();
					}
				});
			}
			// load back available friends in case a friend joined a tournament and is no longer available
			if (g_state.pageToDisplay == '.create-tournament') {
				clearCreateTournamentAvailableFriends();
				await createTournamentLoadAvailableFriends();
			}
			// load back header in case a friend joined a tournament and is no longer available
			clearHomepageHeader();
			await loadHomepageHeader();

			return ;
        }
    };
}

