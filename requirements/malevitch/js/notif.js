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

document.querySelector('.notif-tournament-invite .notif-accept').addEventListener('click', function() {
	acceptTournamentInvite();
});

document.querySelector('.notif-tournament-invite .notif-accept').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		acceptTournamentInvite();
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

function acceptTournamentInvite() {
	// close the notif
	document.querySelector('.notif-tournament-invite').classList.add('visually-hidden');

	// add user to tournament
	// -> POST new player to the tournament players list

	// display tournament page
	// var tournamentId;
	// -> GET tournament info thanks to tournamentId

	document.querySelector('.tournament-info-join-alert').classList.remove('visually-hidden');
	setAriaHidden();

	document.querySelector('.tournament-info-join-input').value = 'cha'; // replace with user nick
	document.querySelector('.tournament-info-join-input').focus();
}

function dismissTournamentInvite() {
	// notif already closed by forEach
	// tell to the sender that user dismissed invitation
}

// Friend invite

document.querySelector('.notif-friend-invite .notif-accept').addEventListener('click', function() {
	acceptFriendInvite();
});

document.querySelector('.notif-friend-invite .notif-accept').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		acceptFriendInvite();
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

function acceptFriendInvite() {
	// close the notif
	document.querySelector('.notif-friend-invite').classList.add('visually-hidden');
	// setAriaHidden();

	// add user to friends list
	// -> POST new friend to our friends list
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

function acceptPlayInvite() {
	// close the notif
	document.querySelector('.notif-play-invite').classList.add('visually-hidden');
	setAriaHidden();

	// show "match found" notif to inform we play against Sender
	var	opponent = document.querySelector('.notif-play-invite .notif-sender').textContent;
	document.querySelector('.notif-match-found .notif-sender').textContent = opponent;
	matchFound();
}

function dismissPlayInvite() {
	// notif already closed by forEach
	// tell to the sender that user dismissed invitation
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
