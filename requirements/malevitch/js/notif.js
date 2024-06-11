// Dismiss notif

document.querySelectorAll('.notif-dismiss').forEach(function(item) {
	item.addEventListener('click', function() {
		item.parentNode.parentNode.classList.add('visually-hidden');
	});

	item.addEventListener('keypress', function(event) {
		if (event.key == 'Enter') {
			item.parentNode.parentNode.classList.add('visually-hidden');
		}
	});
	setAriaHidden();
});

// Tournament invite

document.querySelector('.notif-tournament-invite .notif-accept').addEventListener('click', async function() {
	await acceptTournamentInvite();
});

document.querySelector('.notif-tournament-invite .notif-accept').addEventListener('keypress', async function(e) {
	if (e.key == 'Enter') {
		await acceptTournamentInvite();
	}
});

document.querySelector('.notif-tournament-invite .notif-dismiss').addEventListener('click', function() {
	dismissTournamentInvite();
});

document.querySelector('.notif-tournament-invite .notif-dismiss').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		dismissTournamentInvite();
	}
});

async function acceptTournamentInvite() {
	// close the notif
	document.querySelector('.notif-tournament-invite').classList.add('visually-hidden');

	// display tournament page
	await loadOngoingTournament(item.getAttribute('tournament-id'));

	hideEveryPage();

	g_state.pageToDisplay = '.tournament-info';
	window.history.pushState(g_state, null, "");
	render(g_state);

	// let user choose his nickname for the tournament
	document.querySelector('.tournament-info-join-alert').classList.remove('visually-hidden');
	setAriaHidden();

	document.querySelector('.tournament-info-join-input').value = g_userId;
	document.querySelector('.tournament-info-join-input').focus();
}

function dismissTournamentInvite() {
	// notif already closed by forEach
	// tell to the sender that user dismissed invitation
}

// Friend invite

document.querySelector('.notif-friend-invite .notif-accept').addEventListener('click', async function() {
	await acceptFriendInvite();
});

document.querySelector('.notif-friend-invite .notif-accept').addEventListener('keypress', async function(e) {
	if (e.key == 'Enter') {
		await acceptFriendInvite();
	}
});

document.querySelector('.notif-friend-invite .notif-dismiss').addEventListener('click', function() {
	dismissFriendInvite();
});

document.querySelector('.notif-friend-invite .notif-dismiss').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		dismissFriendInvite();
	}
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

function dismissFriendInvite() {
	// notif already closed by forEach
	// tell to the sender that user dismissed invitation
}

// Play invite

document.querySelector('.notif-play-invite .notif-accept').addEventListener('click', function() {
	acceptPlayInvite();
});

document.querySelector('.notif-play-invite .notif-accept').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		acceptPlayInvite();
	}
});

document.querySelector('.notif-play-invite .notif-dismiss').addEventListener('click', function() {
	dismissPlayInvite();
});

document.querySelector('.notif-play-invite .notif-dismiss').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		dismissPlayInvite();
	}
});

async function acceptPlayInvite() {
	try {
		var	requester = document.querySelector('.notif-play-invite .notif-sender').getAttribute('user-id');
		await accept_invitation_to_game(requester, g_userId);
	} catch (error) {
		console.error(error);
		return ;
	}

	// close the notif
	document.querySelector('.notif-play-invite').classList.add('visually-hidden');
	setAriaHidden();

	// show "match found" notif to inform we play against Sender
	var	opponent = document.querySelector('.notif-play-invite .notif-sender').textContent;
	document.querySelector('.notif-match-found .notif-sender').textContent = opponent;
	matchFound();
}

async function dismissPlayInvite() {
	// notif already closed by forEach
	
	try {		
		// tell to the sender that user dismissed invitation
		var	requester = document.querySelector('.notif-play-invite').getAttribute('user-id');
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

document.querySelector('.notif-search-match .notif-dismiss').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		cancelSearchMatch();
	}
});

function cancelSearchMatch() {
	// notif already closed by forEach

	// cancel match searching

	// reset timer
	seconds = 0;
	minutes = 0;
	hours = 0;
	clearInterval(timerId);
	document.querySelector('.notif-search-match .notif-info').textContent = "00:00:00";
}

// Match found

function matchFound() {
	// show match found notif
	document.querySelector('.notif-match-found').classList.remove('visually-hidden');
	setAriaHidden();

	// wait 5 seconds then close notif
	matchCountdown(5);
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
