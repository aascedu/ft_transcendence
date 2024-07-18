function add_cupidon_in_url(url) {
    return ("/cupidon/matchmaking/" + url)
}

async function invite_friend_to_game(PlayerToInvite) {
    json = {PlayerToInvite: PlayerToInvite};

    response = await fetch_post(add_cupidon_in_url("game-request/"), json);
    if ('RoomName' in response) {
        roomName = response.RoomName;
        document.querySelector('.notif-play-invite').classList.add('visually-hidden');
        setAriaHidden();
		g_invited = true;
        await matchFound(PlayerToInvite);
        showGamePage(roomName);
    }
    else {
        init_matchmaking_socket(g_userId, PlayerToInvite);

		clearTimeout(g_gameInviteTimer);

		g_gameInviteTimer = setTimeout(async () => {
			await cancel_invitation_to_game();
			console.log('timeout');

			// if we are on our friend profile, update availability (play button)
			if (g_state.pageToDisplay == '.user-profile') {
				var	userId = document.querySelector('.user-profile-name').getAttribute('user-id');
				if (PlayerToInvite == userId) {
					document.querySelector('.user-profile-play-icon').classList.remove('visually-hidden');
					setAriaHidden();
				}
			}
		}, 20000);
    }
}

async function cancel_invitation_to_game() {
    fetch_delete(add_cupidon_in_url("game-request/"))
}

async function accept_invitation_to_game(requester, invited) {
    const RoomName = requester + "-" + invited;
	try {
		await fetch_post(add_cupidon_in_url("game-request-response/" + requester + "/" + invited + "/"), json={});
	} catch (error) {
		document.querySelector('.notif-play-invite').classList.add('visually-hidden');
		document.querySelector('.game-already-alert').classList.remove('visually-hidden');
		setAriaHidden();
		return ;
	}

	// show "match found" notif to inform we play against Sender
	var	opponent = document.querySelector('.notif-play-invite .notif-sender').textContent;
	document.querySelector('.notif-match-found .notif-sender').textContent = opponent;
	await matchFound(null);

    showGamePage(RoomName);
}

async function refuse_invitation_to_game(requester, invited) {
    fetch_delete(add_cupidon_in_url("game-request-response/" + requester + "/" + invited + "/"));
}

async function clear_all_invitations() {
    cancel_invitation_to_game();
    refuse_invitation_to_game(0, g_userId);
}

async function restore_availability(requester) {
    fetch_delete(add_cupidon_in_url("game-availability/" + requester + "/"));
}