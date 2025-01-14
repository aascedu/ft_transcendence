// Clear and load available friends

function clearCreateTournament() {
	resetTournamentCreation();
	clearCreateTournamentAvailableFriends();
}

function clearCreateTournamentAvailableFriends() {
	document.querySelectorAll('.create-tournament-invite-container .content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});
}

async function loadCreateTournament() {
	// Clear previous available friends
	document.querySelectorAll('.create-tournament-invite-container .content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});

	document.querySelector('.create-tournament-no-friends').classList.add('visually-hidden');

	// Load available friends
	await createTournamentLoadAvailableFriends();
}

async function createTournamentLoadAvailableFriends() {
	var	availableFriends;

	try {
		availableFriends = await get_available_friends();
		availableFriends = availableFriends.Ava;
	} catch (error) {
		console.error(error);
		document.querySelector('.create-tournament-no-friends').classList.remove('visually-hidden');
		setAriaHidden();
		return ;
	}

	if (availableFriends.length == 0) {
		document.querySelector('.create-tournament-no-friends').classList.remove('visually-hidden');
		setAriaHidden();
		return ;
	}

	var	availableFriendsContainer = document.querySelector('.create-tournament-invite-container');
	var	userInfo;
	var	userPic;

	for (i = 0; i < availableFriends.length; i++) {
		try {
			userInfo = await get_user_info(availableFriends[i].Id);
		} catch (error) {
			console.error(error);
			clearCreateTournamentAvailableFriends();
			document.querySelector('.create-tournament-no-friends').classList.remove('visually-hidden');
			setAriaHidden();
			return ;
		}
		userPic = userInfo.Pic;
		if (userPic == null) {
			userPic = 'assets/general/pong.png';
		}

		availableFriendsContainer.insertAdjacentHTML('beforeend', `\
		<button class="content-card w-100 flex-shrink-0 d-flex justify-content-between align-items-center purple-shadow" user-id="` + availableFriends[i].Id + `">
			<div class="user-card-name unselectable">` + userInfo.Nick + `</div>
			<div class="user-card-picture">
				<img src="` + userPic + `" alt="profile picture of ` + userInfo.Nick + `" draggable="false" (dragstart)="false;" class="unselectable">
			</div>
		</button>`);
	}

	// Adapt new content cards to font size
	document.querySelectorAll('.create-tournament-invite-container .content-card').forEach(function(item) {
		setBaseFontSize(item);
		updateFontSizeOfPage(item, g_prevFontSize);
	});

	// Invite friends

	document.querySelectorAll('.create-tournament-invite-container .content-card').forEach(function(item) {
		item.addEventListener('click', function() {
			item.classList.toggle('create-tournament-invited-friend');
		});
	});
}

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
			tournamentInputWarning.classList.add('visually-hidden');
		}
		setAriaHidden();
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

// Submit tournament creation

document.querySelector('.create-tournament-submit').addEventListener('click', function() {
	checkToSubmitTournament();
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
	setAriaHidden();
}

// Confirm / cancel

document.querySelector('.create-tournament-alert .alert-confirm-button').addEventListener('click', async function () {
	document.querySelector('.create-tournament-alert .alert-confirm-button').disabled = true;
	await createTournament();
	setTimeout(() => {
		document.querySelector('.create-tournament-alert .alert-confirm-button').disabled = false;
	}, 2000);
});

document.querySelector('.create-tournament-alert .alert-cancel-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.create-tournament-alert').classList.add('visually-hidden');
	setAriaHidden();
});

async function createTournament() {
	// Hide alert
	document.querySelector('.create-tournament-alert').classList.add('visually-hidden');

	// Send info to coubertin
	var	tournamentName = document.querySelector('.create-tournament-name-input').value;
	var	numPlayers = document.querySelector('.create-tournament-players-button-chosen').textContent;
	numPlayers = numPlayers.replace(/\D/g, '');
	var	invitedFriends = [];

	document.querySelectorAll('.create-tournament-invited-friend').forEach(function(item) {
		invitedFriends.push(item.getAttribute('user-id'));
	});

	try {
		await create_tournament(tournamentName, numPlayers, invitedFriends, g_userId);
	} catch (error) {
		console.error(error);
		return ;
	}

	// Go to my tournaments
	clearMyTournaments();
	await loadMyTournaments();

	document.querySelector('.my-tournaments-icon').focus();
	
	hideEveryPage();

	g_state.pageToDisplay = '.my-tournaments';
	window.history.pushState(g_state, null, "");
	render(g_state);
}

// Reset tournament creation

function resetTournamentCreation() {
	document.querySelector('.create-tournament').classList.add('visually-hidden');

	document.querySelector('.create-tournament-name-input').value = "";
	var chosen = document.querySelector('.create-tournament-players-button-chosen');
	if (chosen) {
		chosen.classList.remove('create-tournament-players-button-chosen');
	}
	document.querySelectorAll('.create-tournament-invited-friend').forEach(function(item) {
		item.classList.remove('create-tournament-invited-friend');
	});

	setAriaHidden();
}

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.create-tournament').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;

		if (e.key === 'Tab' && isFw && document.activeElement === document.querySelector('.create-tournament-submit')) {
			document.querySelector('.homepage-header-logo').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.activeElement === document.querySelector('.homepage-header-logo')) {
			document.querySelector('.create-tournament-submit').focus();
			e.preventDefault();
		}
	}
});
