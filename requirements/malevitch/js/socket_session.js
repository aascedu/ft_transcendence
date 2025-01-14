async function get_socket_connection_token(path) {
    const response = await fetch_get(path + "connectionView/");
    return response.Key
}

async function init_session_socket() {
    try {
        unique_use_token = await get_socket_connection_token("/hermes/")
        const domain = window.location.host;
        url =  'wss://' + domain + "/hermes/session/" + g_userNick + "?token=" + unique_use_token
        g_sessionSocket = new WebSocket(url)
    } catch (error) {
        console.error("Impossible to connect to session service. Experience may be seriously impacted.");
		document.querySelector('.broken-socket-alert').classList.remove('visually-hidden');
		setAriaHidden();
        return ;
    }
	
	g_sessionSocket.onclose = function() {
		g_sessionSocket = null;
	}

    g_sessionSocket.onmessage = function(event) {
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
        if (obj.type === "notification.friend.disconnected") {
            notificationFriendDisconnected(obj);
            return ;
        }
        if (obj.type === "notification.message") {
            return ;
        }
        if (obj.type === "notification.friendship.request") {
            notificationFriendshipRequest(obj);
            return ;
        }
		if (obj.type === "notification.friendship.refused") {
            notificationFriendshipRefused(obj);
            return ;
        }
        if (obj.type === "notification.friendship.suppressed") {
            notificationFriendshipSuppressed(obj);
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
		if (obj.type === "notification.game.refused") {
            notificationGameRefused(obj);
            return ;
        }
		if (obj.type === "notification.tournament.refused") {
            notificationTournamentRefused(obj);
            return ;
        }
        if (obj.type === "notification.profile.change") {
            notificationProfileChanged(obj);
            return ;
        }
        if (obj.type === "notification.update.state") {
            notificationUpdateAvaState(obj);
            return ;
        }
    }
}

async function notificationFriendshipRequest(data) {
	var	matchFound = document.querySelector('.notif-match-found');
	if (g_state.pageToDisplay == '.game' || !matchFound.classList.contains('visually-hidden')) {
		return ;
	}

	// Display notif
	var	userInfo;
	try {
		userInfo = await get_user_info(data.requester);
	} catch (error) {
		console.error(error);
		return ;
	}
	var	senderElement = document.querySelector('.notif-friend-invite .notif-sender');

	senderElement.textContent = userInfo.Nick;
	senderElement.setAttribute('user-id', data.requester);

	document.querySelector('.notif-friend-invite').classList.remove('visually-hidden');
	setAriaHidden();
}

async function notificationNewFriendship(data) {

	if (g_state.pageToDisplay == '.game') {
		return ;
	}

	// Send notif to tell invite has been accepted
	try {
		var	userInfo = await get_user_info(data.requester);
		document.querySelector('.notif-new-friendship .notif-info').textContent = userInfo.Nick;
		document.querySelector('.notif-new-friendship').classList.remove('visually-hidden');
		setAriaHidden();

		newFriendshipCountdown(2);
	} catch (error) {
		console.error(error);
		return ;
	}

	// if we are on homepage-game, add new friend to friends online
	if (g_state.pageToDisplay == '.homepage-game') {
		await clearHomepageFriends();
		await loadHomepageFriends();
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
	// if we are on the new friend profile, change button to 'remove' instead of pending + add play icon
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
		if (data.requester == userId) {
			clearUserContent();
			await loadUserContent(userId);
		}
	}
	// if we are on a tournament page, load it back so that new friend can appear in available friends
	if (g_state.pageToDisplay == '.tournament-info') {
		if (!document.querySelector('.tournament-info-invite-icon').classList.contains('visually-hidden')) {
			var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');

			clearTournamentInfoInvites();
			await loadTournamentInfoInvites();
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
	var	matchFound = document.querySelector('.notif-match-found');
	if (g_state.pageToDisplay == '.game' || !matchFound.classList.contains('visually-hidden')) {
		return ;
	}

	// Display notif

	var	userInfo;
	try {
		userInfo = await get_user_info(data.requester);
	} catch (error) {
		console.error(error);
		return ;
	}

	var	senderElement = document.querySelector('.notif-tournament-invite .notif-sender');
	var	tournamentElement = document.querySelector('.notif-tournament-invite .notif-info');

	senderElement.textContent = userInfo.Nick;
	senderElement.setAttribute('user-id', data.requester);
	tournamentElement.textContent = data["tournament-name"];
	tournamentElement.setAttribute('tournament-id', data["tournament-id"]);

	document.querySelector('.notif-tournament-invite').classList.remove('visually-hidden');
	setAriaHidden();
}

async function notificationGameAccepted(data) {
	clearTimeout(g_gameInviteTimer);

	if (g_state.pageToDisplay == '.game') {
		return ;
	}

	// Display notif

	var	opponent;
	try {
		opponent = await get_user_info(data.requester);
	} catch (error) {
		console.error(error);
		return ;
	}

	var	opponentElement = document.querySelector('.notif-match-found .notif-sender');

	opponentElement.textContent = opponent.Nick;

	await matchFound(null);
}

async function notificationGameRequest(data) {
	var	matchFound = document.querySelector('.notif-match-found');
	if (g_state.pageToDisplay == '.game' || !matchFound.classList.contains('visually-hidden')) {
		return ;
	}

	// Display notif

	var	userInfo;
	try {
		userInfo = await get_user_info(data.requester);
	} catch (error) {
		console.error(error);
		return ;
	}

	var	senderElement = document.querySelector('.notif-play-invite .notif-sender');

	senderElement.textContent = userInfo.Nick;
	senderElement.setAttribute('user-id', data.requester);

	document.querySelector('.notif-play-invite').classList.remove('visually-hidden');
	setAriaHidden();

	gameInvitedCountdown(20);
}

async function notificationNewClientConnected(data) {
	if (g_state.pageToDisplay == '.game') {
		return ;
	}

	// if we are on homepage-game, add friend to friends online
	if (g_state.pageToDisplay == '.homepage-game') {
		await clearHomepageFriends();
		await loadHomepageFriends();
	}
	// if we are on our friend profile, update availability (play button)
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
		if (data.requester == userId) {
			await clearUserContent();
			await loadUserContent(userId);
		}
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
			clearTournamentInfoInvites();
			await loadTournamentInfoInvites();
		}
	}
	// if we are creating a tournament, load back available friends so that friend appears in available friends
	if (g_state.pageToDisplay == '.create-tournament') {
		clearCreateTournamentAvailableFriends();
		await createTournamentLoadAvailableFriends();
	}
	// load back header to add friend to available friends to play with
	clearHomepageHeader();
	await loadHomepageHeader();
}

async function notificationGameRefused(data) {

	clearTimeout(g_gameInviteTimer);

	if (g_state.pageToDisplay == '.game') {
		return ;
	}

	// If we are on the invited friend profile, display back play icon if friend is available again
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
		if (data.requester == userId) {
			clearUserContent();
			await loadUserContent(userId);
		}
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

async function notificationFriendshipRefused(data) {
	// If we are on the user that refused profile, change button back to add instead of pending
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
		if (data.requester == userId) {
			document.querySelector('.user-profile-pending-icon').classList.add('visually-hidden');
			document.querySelector('.user-profile-add-icon').classList.remove('visually-hidden');
			setAriaHidden();
		}
	}
}

async function notificationFriendshipSuppressed(data) {
	if (g_state.pageToDisplay == '.game') {
		return ;
	}

	// if we are on homepage-game, remove exfriend from friends online
	if (g_state.pageToDisplay == '.homepage-game') {
		await clearHomepageFriends();
		await loadHomepageFriends();
	}
	// if we are on friends list, remove ex friend from friends list
	if (g_state.pageToDisplay == '.friends-list') {
		clearFriendsList();
		await loadFriendsList();

		document.querySelector('.friends-list-icon').focus();

		hideEveryPage();

		g_state.pageToDisplay = '.friends-list';
		window.history.pushState(g_state, null, "");
		render(g_state);
	}
	// if we are on our ex friend profile, remove play icon and change friend invite button to
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
		if (data.requester == userId) {
			clearUserContent();
			await loadUserContent(userId);
		}
	}
	// if we are on a tournament page, load it back so that ex friend is removed from available friends
	if (g_state.pageToDisplay == '.tournament-info') {
		if (!document.querySelector('.tournament-info-invite-icon').classList.contains('visually-hidden')) {
			var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');

			clearTournamentInfoInvites();
			await loadTournamentInfoInvites();
		}
	}
	// if we are creating a tournament, load back available friends so that ex friend is removed from available friends
	if (g_state.pageToDisplay == '.create-tournament') {
		clearCreateTournamentAvailableFriends();
		await createTournamentLoadAvailableFriends();
	}
	// load back header to remove ex friend from available friends to play with
	clearHomepageHeader();
	await loadHomepageHeader();
}

async function notificationTournamentRefused(data) {

	if (g_state.pageToDisplay == '.game') {
		return ;
	}

	// If we are on the invited friend profile, display back play icon if friend is available again
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
		if (data.requester == userId) {
			clearUserContent();
			await loadUserContent(userId);
		}
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

async function notificationProfileChanged(data) {
	if (g_state.pageToDisplay == '.game') {
		return ;
	}

	// if we are on homepage-game, update friend info in friends online
	if (g_state.pageToDisplay == '.homepage-game') {
		await clearHomepageFriends();
		await loadHomepageFriends();
	}
	// if we are on friends list, update friend info in friends online
	if (g_state.pageToDisplay == '.friends-list') {
		clearFriendsList();
		await loadFriendsList();

		document.querySelector('.friends-list-icon').focus();

		hideEveryPage();

		g_state.pageToDisplay = '.friends-list';
		window.history.pushState(g_state, null, "");
		render(g_state);
	}
	// if we are on our friend profile, update friend info
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
		if (data.requester == userId) {
			clearUserContent();
			await loadUserContent(userId);
		}
	}
	// if we are on a tournament page, load it back so that friend info is updated in available friends
	if (g_state.pageToDisplay == '.tournament-info') {
		if (!document.querySelector('.tournament-info-invite-icon').classList.contains('visually-hidden')) {
			var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');

			clearTournamentInfoInvites();
			await loadTournamentInfoInvites();
		}
	}
	// if we are creating a tournament, load back available friends so that friend info is updated in available friends
	if (g_state.pageToDisplay == '.create-tournament') {
		clearCreateTournamentAvailableFriends();
		await createTournamentLoadAvailableFriends();
	}
	// load back header to remove ex friend from available friends to play with
	clearHomepageHeader();
	await loadHomepageHeader();
}
async function notificationFriendDisconnected(data) {
	if (g_state.pageToDisplay == '.game') {
		return ;
	}

	// if we are on homepage-game, remove friend from friends online
	if (g_state.pageToDisplay == '.homepage-game') {
		await clearHomepageFriends();
		await loadHomepageFriends();
	}
	// if we are on our friend profile, update availability (play button)
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
		if (data.requester == userId) {
			await clearUserContent();
			await loadUserContent(userId);
		}
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
	// if we are on a tournament page, load it back so that friend is removed from available friends
	if (g_state.pageToDisplay == '.tournament-info') {
		if (!document.querySelector('.tournament-info-invite-icon').classList.contains('visually-hidden')) {
			clearTournamentInfoInvites();
			await loadTournamentInfoInvites();
		}
	}
	// if we are creating a tournament, load back available friends so that friend is removed from available friends
	if (g_state.pageToDisplay == '.create-tournament') {
		clearCreateTournamentAvailableFriends();
		await createTournamentLoadAvailableFriends();
	}
	// load back header to remove friend from available friends to play with
	clearHomepageHeader();
	await loadHomepageHeader();
}

async function notificationUpdateAvaState(data) {
	// if we are on our friend profile, update availability (play button)
	if (g_state.pageToDisplay == '.user-profile') {
		var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
		if (data.requester == userId) {
			await clearUserContent();
			await loadUserContent(userId);
		}
	}
	// if we are creating a tournament, load back available friends so that friend is updated in available friends
	if (g_state.pageToDisplay == '.create-tournament') {
		clearCreateTournamentAvailableFriends();
		await createTournamentLoadAvailableFriends();
	}
	// load back header to update friend in available friends to play with
	clearHomepageHeader();
	await loadHomepageHeader();
}
