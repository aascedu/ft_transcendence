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


async function notificationFriendshipRequest(data) {
    console.log('FriendshipRequest');
    console.log(data);

	var	userInfo = await get_user_info(data.requester);
	var	senderElement = document.querySelector('.notif-friend-invite .notif-sender');

	senderElement.textContent = userInfo.Nick;
	senderElement.setAttribute('user-id', data.requester);

	document.querySelector('.notif-friend-invite').classList.remove('visually-hidden');
	setAriaHidden();
}

async function notificationNewFriendship(data) {
    console.log('NewFriendship');
    console.log(data);

	// Send notif to tell invite has been accepted
	var	userInfo = await get_user_info(data.requester);
	document.querySelector('.notif-new-friendship .notif-info').textContent = userInfo.Nick;
	document.querySelector('.notif-new-friendship').classList.remove('visually-hidden');
	setAriaHidden();

	newFriendshipCountdown(2);

	// if we are on homepage-game, add new friend to friends online
	if (g_state.pageToDisplay == '.homepage-game') {
		clearHomepageContent();
		await setHomepageContent();

		g_state.pageToDisplay = '.homepage-game';
		window.history.pushState(g_state, null, "");
		render(g_state);
	}
	// if we are on friends list, add new friend to friends list
	if (g_state.pageToDisplay == '.friends-list') {
		clearFriendsList();
		await loadFriendsList();

		document.querySelector('.friends-list-icon').focus();

		hideEveryPage();

		g_state.pageToDisplay = '.friends-list';
		window.history.pushState(g_state, null, "");
		render(g_state);
	}
	// if we are on the new friend profile, change button to 'remove' instead of pending
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');

		if (userId == data.requester) {
			document.querySelector('.user-profile-pending-icon').classList.add('visually-hidden');
			document.querySelector('.user-profile-remove-icon').classList.remove('visually-hidden');
			setAriaHidden();
		}
	}
	// if we are on a tournament page, load it back so that new friend can appear in available friends
	if (g_state.pageToDisplay == '.tournament-info') {
		if (!document.querySelector('.tournament-info-invite-icon').classList.contains('visually-hidden')) {
			var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');

			clearTournamentInfo();
			await loadOngoingTournament(tournamentId);
		}
	}
	// if we are creating a tournament, load back available friends so that new friend appears in available friends
	if (g_state.pageToDisplay == '.create-tournament') {
		clearCreateTournamentAvailableFriends();
		await createTournamentLoadAvailableFriends();
	}
	// load back header to add friend to available friends to play with
	clearHomepageHeader();
	await loadHomepageHeader();
}

async function notificationTournamentRequest(data) {
    console.log('TournamentRequest');
    console.log(data);

	var	userInfo = await get_user_info(data.requester);
	var	senderElement = document.querySelector('.notif-tournament-invite .notif-sender');
	var	tournamentElement = document.querySelector('.notif-tournament-invite .notif-info');

	senderElement.textContent = userInfo.Nick;
	tournamentElement.textContent = data["tournament-name"];
	tournamentElement.setAttribute('tournament-id', data["tournament-id"]);

	document.querySelector('.notif-tournament-invite').classList.remove('visually-hidden');
	setAriaHidden();
}

async function notificationGameAccepted(data) {
    console.log("game accepted");
    console.log(data);

	var	opponent = await get_user_info(data.requester);
	var	opponentElement = document.querySelector('.notif-match-found .notif-sender');

	opponentElement.textContent = opponent;

	matchFound();
}

async function notificationGameRequest(data) {
    console.log("game request");
    console.log(data);

	var	userInfo = await get_user_info(data.requester);
	var	senderElement = document.querySelector('.notif-play-invite .notif-sender');

	senderElement.textContent = userInfo.Nick;

	document.querySelector('.notif-play-invite').classList.remove('visually-hidden');
	setAriaHidden();
}

async function notificationNewClientConnected(data) {
    console.log("new friend connected");
    console.log(data);

	// if we are on homepage-game, add friend to friends online
	if (g_state.pageToDisplay == '.homepage-game') {
		clearHomepageContent();
		await setHomepageContent();

		g_state.pageToDisplay = '.homepage-game';
		window.history.pushState(g_state, null, "");
		render(g_state);
	}
	// if we are on friends list, update it
	if (g_state.pageToDisplay == '.friends-list') {
		clearFriendsList();
		await loadFriendsList();

		document.querySelector('.friends-list-icon').focus();

		hideEveryPage();

		g_state.pageToDisplay = '.friends-list';
		window.history.pushState(g_state, null, "");
		render(g_state);
	}
	// if we are on a tournament page, load it back so that friend can appear in available friends
	if (g_state.pageToDisplay == '.tournament-info') {
		if (!document.querySelector('.tournament-info-invite-icon').classList.contains('visually-hidden')) {
			var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');

			await loadOngoingTournament(tournamentId);
		}
	}
	// if we are creating a tournament, load back available friends so that friend appears in available friends
	if (g_state.pageToDisplay == '.create-tournament') {
		clearCreateTournamentAvailableFriends();
		await createTournamentLoadAvailableFriends();
	}
	// load back header to add friend to available friends to play with
	await loadHomepageHeader();
}

async function notificationMessage(data) {
    console.log("new message");
    console.log(data);
}
