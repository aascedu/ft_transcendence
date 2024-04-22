// Hide when clicking top left button

document.querySelector('.create-tournament-icon').addEventListener('click', function() {
	document.querySelector('.create-tournament').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Hitting enter on input

document.querySelector('.create-tournament-name-input').addEventListener('keypress', function(event) {
	if (event.key == 'Enter') {
		// Check if tournament name is correct
		var	tournamentNameInput = document.querySelector('.create-tournament-name-input');
		var	tournamentInputWarning = document.querySelector('.create-tournament-name-input-warning');

		if (!warnInvalidTournamentName(tournamentNameInput.value, tournamentInputWarning)) {
			// Show warning
			var locale = document.querySelector('.homepage-header-language-selector button img').alt;
			switchLanguageContent(locale);
			tournamentInputWarning.classList.remove('visually-hidden');
		}
		else {
			document.querySelector('.create-tournament-players-button').focus();
		}

	}
});

// Choose number of players

document.querySelectorAll('.create-tournament-players-button').forEach(function(item) {
	item.addEventListener('click', function() {
		item.classList.add('create-tournament-players-button-chosen');

		// change aspect of other button
		document.querySelectorAll('.create-tournament-players-button').forEach(function(other) {
			if (other !== item) {
				other.classList.remove('create-tournament-players-button-chosen');
			}
		});
	});

	item.addEventListener('keypress', function(event) {
		if (event.key == 'Enter') {
			item.classList.add('create-tournament-players-button-chosen');
	
			// change aspect of other button
			document.querySelectorAll('.create-tournament-players-button').forEach(function(other) {
				if (other !== item) {
					other.classList.remove('create-tournament-players-button-chosen');
				}
			});
		}
	});
});

// Check if user has selected a number of players

function checkSelectedNumberOfPlayers() {
    return Array.from(document.querySelectorAll('.create-tournament-players-button')).some(function(item) {
        return item.classList.contains('create-tournament-players-button-chosen');
    });
}

// Invite friends

document.querySelectorAll('.create-tournament-invite-container .content-card').forEach(function(item) {
	item.addEventListener('click', function() {
		item.classList.toggle('create-tournament-invited-friend');
	});

	item.addEventListener('keypress', function(event) {
		if (event.key == 'Enter') {
			item.classList.toggle('create-tournament-invited-friend');
		}
	});
});

// Submit tournament creation

document.querySelector('.create-tournament-submit').addEventListener('click', function() {
	checkToSubmitTournament();
});

document.querySelector('.create-tournament-submit').addEventListener('keypress', function(event) {
	if (event.key === 'Enter') {
		checkToSubmitTournament();
	}
});

function checkToSubmitTournament() {
	// Check if tournament name is correct
	var	tournamentNameInput = document.querySelector('.create-tournament-name-input');
	var	tournamentInputWarning = document.querySelector('.create-tournament-name-input-warning');
	var	tournamentPlayersWarning = document.querySelector('.create-tournament-players-warning');

	if (!warnInvalidTournamentName(tournamentNameInput.value, tournamentInputWarning)) {
		// Show warning
		var locale = document.querySelector('.homepage-header-language-selector button img').alt;
		switchLanguageContent(locale);
		tournamentInputWarning.classList.remove('visually-hidden');
	}
	else if (!checkSelectedNumberOfPlayers()) {
		// Hide previous warning
		tournamentInputWarning.classList.add('visually-hidden');

		// Show warning
		tournamentPlayersWarning.classList.remove('visually-hidden');
	}
	else {
		// Hide warnings
		tournamentInputWarning.classList.add('visually-hidden');
		tournamentPlayersWarning.classList.add('visually-hidden');

		// Show alert
		document.querySelector('.create-tournament-alert').classList.remove('visually-hidden');
		document.querySelector('.create-tournament-alert .alert-confirm-button').focus();
	}
}

// Confirm / cancel

document.querySelector('.create-tournament-alert .alert-confirm-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.create-tournament-alert').classList.add('visually-hidden');

	// Send info to db
	// Send invites to selected friends
	// Display tournament page with info
});

document.querySelector('.create-tournament-alert .alert-confirm-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		// Hide alert
		document.querySelector('.create-tournament-alert').classList.add('visually-hidden');
	
		// Send info to db
		// Send invites to selected friends
		// Display tournament page with info
	}
});

document.querySelector('.create-tournament-alert .alert-cancel-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.create-tournament-alert').classList.add('visually-hidden');
});

document.querySelector('.create-tournament-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		// Hide alert
		document.querySelector('.create-tournament-alert').classList.add('visually-hidden');
	}
});

// Reset tournament creation

function resetTournamentCreation() {
	document.querySelector('.create-tournament-name-input').value = "";
	document.querySelector('.create-tournament-players-button-chosen').classList.remove('create-tournament-players-button-chosen');
	document.querySelectorAll('.create-tournament-invited-friend').forEach(function(item) {
		item.classList.remove('create-tournament-invited-friend');
	});
}