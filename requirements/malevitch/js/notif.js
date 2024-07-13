// Dismiss notif

document.querySelectorAll('.notif-dismiss').forEach(function(item) {
	item.addEventListener('click', function() {
		item.parentNode.parentNode.classList.add('visually-hidden');
	});
	setAriaHidden();
});

// Tournament invite

document.querySelector('.notif-tournament-invite .notif-accept').addEventListener('click', async function() {
	document.querySelector('.notif-tournament-invite .notif-accept').disabled = true;
	await acceptTournamentInvite();
});

document.querySelector('.notif-tournament-invite .notif-dismiss').addEventListener('click', function() {
	document.querySelector('.notif-tournament-invite .notif-dismiss').disabled = true;
	dismissTournamentInvite();
	setTimeout(() => {
		document.querySelector('.notif-tournament-invite .notif-dismiss').disabled = false;
	}, 300);
});

async function acceptTournamentInvite() {
	// close the notif
	document.querySelector('.notif-tournament-invite').classList.add('visually-hidden');

	// display tournament page
	var	tournamentId = document.querySelector('.notif-tournament-invite .notif-info').getAttribute('tournament-id');
	var	acceptButton = document.querySelector('.notif-tournament-invite .notif-accept');

	await loadOngoingTournament(tournamentId, acceptButton);

	setTimeout(() => {
		acceptButton.disabled = false;
	}, 300);

	hideEveryPage();

	g_state.pageToDisplay = '.tournament-info';
	window.history.pushState(g_state, null, "");
	render(g_state);

	// let user choose his nickname for the tournament
	document.querySelector('.tournament-info-join-alert').classList.remove('visually-hidden');
	setAriaHidden();

	document.querySelector('.tournament-info-join-input').value = g_userNick;
	document.querySelector('.tournament-info-join-input').focus();
}

async function dismissTournamentInvite() {
	// notif already closed by forEach
	// tell to the sender that user dismissed invitation
	try {
		var	tournamentId = document.querySelector('.notif-tournament-invite .notif-info').getAttribute('tournament-id');
		await refuse_invitation_to_tournament(tournamentId);
	} catch (error) {
		console.error(error);
	}
}

// Friend invite

document.querySelector('.notif-friend-invite .notif-accept').addEventListener('click', async function() {
	document.querySelector('.notif-friend-invite .notif-accept').disabled = true;
	await acceptFriendInvite();
	setTimeout(() => {
		document.querySelector('.notif-friend-invite .notif-accept').disabled = false;
	}, 300);
});

document.querySelector('.notif-friend-invite .notif-dismiss').addEventListener('click', function() {
	document.querySelector('.notif-friend-invite .notif-dismiss').disabled = true;
	dismissFriendInvite();
	setTimeout(() => {
		document.querySelector('.notif-friend-invite .notif-dismiss').disabled = false;
	}, 300);
});

async function acceptFriendInvite() {
	try {
		// add user to friends list
		var userId = document.querySelector('.notif-friend-invite .notif-sender').getAttribute('user-id');
	
		await post_friend(userId);
	} catch (error) {
		console.error(error);
		return ;
	}

	// close the notif
	document.querySelector('.notif-friend-invite').classList.add('visually-hidden');
	setAriaHidden();

	// if we are on homepage-game, add new friend to friends online
	if (g_state.pageToDisplay == '.homepage-game') {
		await clearHomepageFriends();
		await loadHomepageFriends();

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
	// if we are on the new friend profile, change button to 'remove' instead of pending + add play icon
	if (g_state.pageToDisplay == '.user-profile') {
		var	profileId = document.querySelector('.user-profile-name').getAttribute('user-id');
		var	requesterId = document.querySelector('.notif-friend-invite .notif-sender').getAttribute('user-id');
		if (requesterId == profileId) {
			clearUserContent();
			await loadUserContent(profileId);
		}
	}
	// if we are on a tournament page, load it back so that new friend can appear in available friends
	if (g_state.pageToDisplay == '.tournament-info') {
		if (!document.querySelector('.tournament-info-invite-icon').classList.contains('visually-hidden')) {

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

async function dismissFriendInvite() {
	// notif already closed by forEach
	// tell to the sender that user dismissed invitation
	try {
		var	requesterId = document.querySelector('.notif-friend-invite .notif-sender').getAttribute('user-id');
		await delete_friend(requesterId);
	} catch (error) {
		console.error(error);
	}
}

// Play invite

document.querySelector('.notif-play-invite .notif-accept').addEventListener('click', function() {
	document.querySelector('.notif-play-invite .notif-accept').disabled = true;
	acceptPlayInvite();
	setTimeout(() => {
		document.querySelector('.notif-play-invite .notif-accept').disabled = false;
	}, 300);
});

document.querySelector('.notif-play-invite .notif-dismiss').addEventListener('click', function() {
	document.querySelector('.notif-play-invite .notif-dismiss').disabled = true;
	dismissPlayInvite();
	setTimeout(() => {
		document.querySelector('.notif-play-invite .notif-dismiss').disabled = false;
	}, 300);
});

async function acceptPlayInvite() {
	// close the notif
	document.querySelector('.notif-play-invite').classList.add('visually-hidden');
	setAriaHidden();

	try {
		var	requester = document.querySelector('.notif-play-invite .notif-sender').getAttribute('user-id');
		await accept_invitation_to_game(requester, g_userId);
	} catch (error) {
		console.error(error);
	}
}

async function dismissPlayInvite() {
	// notif already closed by forEach
	
	try {		
		// tell to the sender that user dismissed invitation
		var	requester = document.querySelector('.notif-play-invite .notif-sender').getAttribute('user-id');
		await refuse_invitation_to_game(requester, g_userId);
	} catch (error) {
		console.error(error);
	}
}

// Searching match

function searchMatch() {
	// show notif
	document.querySelector('.notif-search-match').classList.remove('visually-hidden');
	setAriaHidden();
	document.querySelector('.notif-search-match .notif-dismiss').focus();

	// count time elapsed
	startTimer();
}

let seconds = 0;
let minutes = 0;
let hours = 0;
let timerId;

function startTimer() {
    timerId = setInterval(function() {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
            if (minutes >= 60) {
                minutes = 0;
                hours++;
            }
        }

		var displaySeconds;
		var	displayMinutes;
		var	displayHours;

		displaySeconds = seconds < 10 ? "0" + seconds : seconds;
		displayMinutes = minutes < 10 ? "0" + minutes : minutes;
		displayHours = hours < 10 ? "0" + hours : hours;

        // Display updated time
		var	displayTime = document.querySelector('.notif-search-match .notif-info');
        displayTime.textContent = displayHours + ":" + displayMinutes + ":" + displaySeconds;
    }, 1000);
}

document.querySelector('.notif-search-match .notif-dismiss').addEventListener('click', function() {
	cancelSearchMatch();
});

function cancelSearchMatch() {
	// notif already closed by forEach
	// cancel match searching
	try {
		if (g_matchmakingSocket) {
			restore_availability(g_userId);
		}
	} catch (error) {
		console.error(error);
	}

	// reset timer
	seconds = 0;
	minutes = 0;
	hours = 0;
	clearInterval(timerId);
	document.querySelector('.notif-search-match .notif-info').textContent = "00:00:00";
}

// Match found

async function matchFound(opponent) {
	// show opponent
	// if opponent is null, that means we have already done this before
	if (opponent != null) {
		var	opponentNick;
		try {
			opponentNick = await get_user_info(opponent);
			opponentNick = opponentNick.Nick;
		} catch (error) {
			console.error(error);
			return ;
		}
	
		var	opponentElement = document.querySelector('.notif-match-found .notif-sender');
		opponentElement.textContent = opponentNick;
	}

	// reset timer & hide search match notif
	seconds = 0;
	minutes = 0;
	hours = 0;
	clearInterval(timerId);
	document.querySelector('.notif-search-match .notif-info').textContent = "00:00:00";
	document.querySelector('.notif-search-match').classList.add('visually-hidden');

	// reset match scores
	document.querySelectorAll('.game .score').forEach(function(item) {
		item.textContent = '0';
	});

	// show match found notif
	document.querySelector('.notif-match-found').classList.remove('visually-hidden');
	setAriaHidden();

	// wait 5 seconds then close notif
	matchCountdown(5);
	await delay(5000);
}

function matchCountdown(seconds) {
	if (seconds > 0) {
		document.querySelector('.notif-match-found .notif-info').textContent = seconds;
		setTimeout(() => matchCountdown(seconds - 1), 1000);
	}
	else {
		// close notif
		document.querySelector('.notif-match-found').classList.add('visually-hidden');
		setAriaHidden();

		// start match
	}
}

// Invite send

function inviteSentNotif(invited) {
	// update notif with invited nick
	document.querySelector('.notif-invite-sent .notif-info').textContent = invited;

	// show notif
	document.querySelector('.notif-invite-sent').classList.remove('visually-hidden');
	setAriaHidden();

	// wait 2 seconds and close notif
	inviteSentCountdown(2);
}

function inviteSentCountdown(seconds) {
	if (seconds > 0) {
		setTimeout(() => inviteSentCountdown(seconds - 1), 1000);
	}
	else {
		// close notif
		document.querySelector('.notif-invite-sent').classList.add('visually-hidden');
		setAriaHidden();
	}
}

// 

function newFriendshipCountdown(seconds) {
	if (seconds > 0) {
		setTimeout(() => newFriendshipCountdown(seconds - 1), 1000);
	}
	else {
		// close notif
		document.querySelector('.notif-new-friendship').classList.add('visually-hidden');
		setAriaHidden();
	}
}

// 

function forbiddenNotif() {
	// show notif
	document.querySelector('.notif-forbidden').classList.remove('visually-hidden');
	setAriaHidden();

	// wait 2 seconds and close notif
	forbiddenCountdown(2);
}

function forbiddenCountdown(seconds) {
	if (seconds > 0) {
		setTimeout(() => forbiddenCountdown(seconds - 1), 1000);
	}
	else {
		// close notif
		document.querySelector('.notif-forbidden').classList.add('visually-hidden');
		setAriaHidden();
	}
}

//

function gameInvitedCountdown(seconds) {
	if (seconds > 0) {
		setTimeout(() => gameInvitedCountdown(seconds - 1), 1000);
	}
	else {
		// close notif
		document.querySelector('.notif-play-invite').classList.add('visually-hidden');
		setAriaHidden();
	}
}

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	document.querySelectorAll('.notif').forEach(function(item) {
		if (!item.classList.contains('visually-hidden')) {
			let isFw =!e.shiftKey;

			// Search match
			if (e.key === 'Tab' && document.activeElement === document.querySelector('.notif-search-match .notif-dismiss')) {
				document.querySelector('.homepage-header-logo').focus();
				e.preventDefault();
			}
		}
	})
});
