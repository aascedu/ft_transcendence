// Load tournament info from backend

// Ongoing tournament : load from Coubertin
async function loadOngoingTournament(id) {
	var	tournamentInfo;

	try {
		tournamentInfo = await get_tournament_infos(id);
	} catch (error) {
		console.error(error);
		return ;
	}

	clearTournamentInfo();
	await loadTournamentInfo(tournamentInfo, true);
}

// Closed tournament : load from Mnemosine
async function loadClosedTournament(id) {
	var	tournamentInfo;

	try {
		tournamentInfo = await get_tournament_by_id(id);
	} catch (error) {
		console.error(error);
		return ;
	}

	clearTournamentInfo();
	await loadTournamentInfo(tournamentInfo, false);
}

async function loadTournamentInfo(tournamentInfo, ongoing) {
	// Save tournament id on the page
	document.querySelector('.tournament-info-name').setAttribute('tournament-id', tournamentInfo.Id);

	// Display tournament name
	document.querySelector('.tournament-info-name').textContent = tournamentInfo.Name;

	var	playersContainer = document.querySelector('.tournament-info-players');
	var	confirmedPlayers = [];
	var pendingPlayers = [];
	var	numPlayers;
	var userId;
	var	userInfo;
	var	userPic;

	if (ongoing == true) {
		// Display online friends that aren't already invited to tournament
		await loadTournamentInfoInvites();

		// If you are owner, display edit, invite and kick buttons
		if (tournamentInfo.Owner == g_userId) {
			document.querySelector('.tournament-info-edit-icon').classList.remove('visually-hidden');
			document.querySelector('.tournament-info-invite-icon').classList.remove('visually-hidden');
			document.querySelectorAll('.tournament-kick-player').forEach(function(item) {
				if (item.parentElement.getAttribute('user-id') != g_userId) {
					item.classList.remove('visually-hidden');
				}
			});
		}
		else {
			document.querySelector('.tournament-info-edit-icon').classList.add('visually-hidden');
			document.querySelector('.tournament-info-invite-icon').classList.add('visually-hidden');
			document.querySelectorAll('.tournament-kick-player').forEach(function(item) {
				item.classList.add('visually-hidden');
			});
		}
		setAriaHidden();

		// Display icons only if tournament has not yet started
		if (tournamentInfo.Started == false) {
			document.querySelector('.tournament-info-invite-icon').classList.remove('visually-hidden');
			for (i = 0; i < confirmedPlayers.length; i++) {
				userId = confirmedPlayers[i].Id;
				if (userId == g_userId) {
					document.querySelector('.tournament-info-leave-icon').classList.remove('visually-hidden');
					document.querySelector('.tournament-info-invite-icon').classList.remove('visually-hidden');
					break ;
				}
			}
			if (document.querySelector('.tournament-info-leave-icon').classList.contains('visually-hidden')) {
				document.querySelector('.tournament-info-join-icon').classList.remove('visually-hidden');
				if (tournamentInfo.Owner != g_userId) {
					document.querySelector('.tournament-info-invite-icon').classList.add('visually-hidden');
				}
			}
		}
		else {
			// Hide all icons
			document.querySelector('.tournament-info-edit-icon').classList.add('visually-hidden');
			document.querySelectorAll('.tournament-kick-player').forEach(function(item) {
				item.classList.add('visually-hidden');
			});
			document.querySelector('.tournament-info-check-icon').classList.add('visually-hidden');
			document.querySelector('.tournament-info-invite-icon').classList.add('visually-hidden');
			document.querySelector('.tournament-info-join-icon').classList.add('visually-hidden');
			document.querySelector('.tournament-info-leave-icon').classList.add('visually-hidden');
		}
		setAriaHidden();

		// Update info
		numPlayers = tournamentInfo.NumPlayers;
		confirmedPlayers = tournamentInfo.Confirmed;
		pendingPlayers = tournamentInfo.Pending;
	}
	else {
		// Hide all icons
		document.querySelector('.tournament-info-edit-icon').classList.add('visually-hidden');
		document.querySelectorAll('.tournament-kick-player').forEach(function(item) {
			item.classList.add('visually-hidden');
		});
		document.querySelector('.tournament-info-check-icon').classList.add('visually-hidden');
		document.querySelector('.tournament-info-invite-icon').classList.add('visually-hidden');
		document.querySelector('.tournament-info-join-icon').classList.add('visually-hidden');
		document.querySelector('.tournament-info-leave-icon').classList.add('visually-hidden');
		setAriaHidden();

		// Update info

		numPlayers = tournamentInfo.Players.length;
		confirmedPlayers = tournamentInfo.Players;
	}

	// Display players

	// If no player at all
	if ((confirmedPlayers.length + pendingPlayers.length) == 0) {
		document.querySelector('.tournament-info-no-players').classList.remove('visually-hidden');
		setAriaHidden();
		return ;
	}

	document.querySelector('.tournament-info-no-players').classList.add('visually-hidden');
	setAriaHidden();

	// Display number of players
	document.querySelector('.tournament-info-players-num').textContent = confirmedPlayers.length + '/' + numPlayers;

	// Display players that are confirmed
	for (i = 0; i < confirmedPlayers.length; i++) {
		userId = confirmedPlayers[i].Id;
		userInfo = await get_user_info(userId);
		userPic = userInfo.Pic;
		if (userPic == null) {
			userPic = 'assets/general/pong.png';
		}

		playersContainer.insertAdjacentHTML('beforeend', `\
		<button class="content-card d-flex justify-content-between align-items-center purple-shadow" user-id="` + userId + `">
		<div class="user-card-name unselectable">` + confirmedPlayers[i].Alias + `</div>
		<div class="user-card-picture">
		<img src="` + userPic + `" alt="profile picture of ` + confirmedPlayers[i].Alias + `" draggable="false" (dragstart)="false;" class="unselectable">
		</div>
		<div class="tournament-kick-player d-flex justify-content-center align-items-center position-relative visually-hidden" tabindex="0">
		<img src="assets/general/remove-black.svg" alt="kick player" draggable="false" (dragstart)="false;" class="unselectable">
		</div>
		</button>`);
	}

	if (ongoing == true) {
		// Display invited players that haven't joined (pending)
		for (i = 0; i < pendingPlayers.length; i++) {
			userId = pendingPlayers[i];
			userInfo = await get_user_info(pendingPlayers[i]);
			userPic = userInfo.Pic;
			if (userPic == null) {
				userPic = 'assets/general/pong.png';
			}

			playersContainer.insertAdjacentHTML('beforeend', `\
			<button class="content-card invite-pending d-flex justify-content-between align-items-center purple-shadow" user-id="` + userId + `">
				<div class="d-flex flex-nowrap align-items-center">
					<div class="user-card-name unselectable">`+ userInfo.Nick + `</div>
					<div class="user-card-pending" data-language="pending">(pending...)</div>
				</div>
				<div class="user-card-picture">
					<img src="` + userPic + `" alt="profile picture of `+ userInfo.Nick + `" draggable="false" (dragstart)="false;" class="unselectable">
				</div>
				<div class="tournament-kick-player d-flex justify-content-center align-items-center position-absolute visually-hidden">
					<img src="assets/general/remove-black.svg" alt="kick player" draggable="false" (dragstart)="false;" class="unselectable">
				</div>
			</button>`);
		}
	}

	// Load user profile page when clicking on a player

	document.querySelectorAll('.tournament-info-players .content-card').forEach(function(item) {
		item.addEventListener('click', async function(event) {
			var userId = await event.target.getAttribute('user-id');
			if (userId == null) {
				setTimeout(async () => {
					userId = await event.target.getAttribute('user-id');
				}, 500);
			}
			await loadUserProfile(userId);
		});
	});

	// Display tournament bracket

	var	matchInRound = 0;
	var	games = tournamentInfo.Games;
	var	matchSelector;
	var	res;

	if (numPlayers == 4) {
		// Display 4 players bracket
		if (document.querySelector('.bracket-round-two') != null) {
			document.querySelector('.bracket-round-one').classList.add('visually-hidden');
			document.querySelector('.bracket-round-two').classList.add('bracket-round-one');
			document.querySelector('.bracket-round-two').classList.add('bracket-round-one-four');
			document.querySelector('.bracket-round-two').classList.remove('bracket-round-two');
			document.querySelector('.bracket-round-three').classList.add('bracket-round-three-four');
			setAriaHidden();
		}

		// Load info

		for (i = 0; i < games.length; i++) {
			if (games[i].Round == 1) {
				matchSelector = document.querySelectorAll('.bracket-round-one-four .bracket-match');
				res = await loadBracketMatchContent(confirmedPlayers, games[i], matchSelector[matchInRound]);
				if (!res) {
					return ;
				}
				matchInRound++;
				if (matchInRound > 1) {
					matchInRound = 0;
				}
			}
			else if (games[i].Round == 2) {
				matchSelector = document.querySelectorAll('.bracket-round-three-four .bracket-match');
				res = await loadBracketMatchContent(confirmedPlayers, games[i], matchSelector[matchInRound]);
				if (!res) {
					return ;
				}
			}
		}
	}
	else {
		// Display 8 players bracket if needed
		if (document.querySelector('.bracket-round-one-four') != null) {
			document.querySelector('.bracket-round-one').classList.remove('visually-hidden');
			document.querySelector('.bracket-round-one-four').classList.add('bracket-round-two');
			document.querySelector('.bracket-round-one-four').classList.remove('bracket-round-one');
			document.querySelector('.bracket-round-one-four').classList.remove('bracket-round-one-four');
			document.querySelector('.bracket-round-three-four').classList.remove('bracket-round-three-four');
			setAriaHidden();
		}

		// Load info

		var	matchInRound = 0;
		var	games = tournamentInfo.Games;
		var	matchSelector;
		var	res;

		for (i = 0; i < games.length; i++) {
			if (games[i].Round == 1) {
				matchSelector = document.querySelectorAll('.bracket-round-one .bracket-match');
				res = await loadBracketMatchContent(confirmedPlayers, games[i], matchSelector[matchInRound]);
				if (!res) {
					return ;
				}
				matchInRound++;
				if (matchInRound > 3) {
					matchInRound = 0;
				}
			}
			else if (games[i].Round == 2) {
				matchSelector = document.querySelectorAll('.bracket-round-two .bracket-match');
				res = await loadBracketMatchContent(confirmedPlayers, games[i], matchSelector[matchInRound]);
				if (!res) {
					return ;
				}
				matchInRound++;
				if (matchInRound > 1) {
					matchInRound = 0;
				}
			}
			else {
				matchSelector = document.querySelectorAll('.bracket-round-three .bracket-match');
				res = await loadBracketMatchContent(confirmedPlayers, games[i], matchSelector[matchInRound]);
				if (!res) {
					return ;
				}
			}
		}
	}

	document.querySelectorAll('.tournament-info-players .content-card').forEach(function(item) {
		item.addEventListener('click', async function(event) {
			var userId = await event.target.getAttribute('user-id');
			if (userId == null) {
				setTimeout(async () => {
					userId = await event.target.getAttribute('user-id');
				}, 500);
			}
			await loadUserProfile(userId);
		});
	});

	// Keyboard navigation

	document.addEventListener('keydown', async function(e) {
		await tournamentInfoKeyboardNavigation(e, tournamentInfo, ongoing);
	});
}

async function loadBracketMatchContent(tournamentPlayers, match, matchSelector) {
	// If this match wasn't played yet
	if (match.Played == false) {
		return 0;
	}

	var	matchInfo = match.Game;

	// define order
	var	playerId;
	var	winnerOrder;
	var	loserOrder;
	var	winnerAlias;
	var	loserAlias;
	for (j = 0; j < tournamentPlayers.length; j++)
	{
		playerId = tournamentPlayers[j].Id;
		if (playerId == matchInfo.Winner) {
			winnerOrder = j;
			winnerAlias = tournamentPlayers[j].Alias;
		}
		if (playerId == matchInfo.Loser) {
			loserOrder = j;
			loserAlias = tournamentPlayers[j].Alias;
		}
	}
	var bracketPlayers = matchSelector.querySelectorAll('.bracket-player');
	if (winnerOrder < loserOrder) {
		await loadBracketPlayerContent(matchInfo.Winner, winnerAlias, matchInfo["Winner-score"], bracketPlayers[0]);
		await loadBracketPlayerContent(matchInfo.Loser, loserAlias, matchInfo["Loser-score"], bracketPlayers[1]);
	}
	else {
		await loadBracketPlayerContent(matchInfo.Loser, loserAlias, matchInfo["Loser-score"], bracketPlayers[0]);
		await loadBracketPlayerContent(matchInfo.Winner, winnerAlias, matchInfo["Winner-score"], bracketPlayers[1]);
	}
	return 1;
}

async function loadBracketPlayerContent(playerId, playerAlias, playerScore, playerSelector) {
	var userInfo;

	try {
		userInfo = await get_user_info(playerId);
	} catch (error) {
		console.error(error);
		return ;
	}

	var	userPic = userInfo.Pic;

	if (userPic == null) {
		userPic = 'assets/general/pong.png';
	}
	if (playerScore == null) {
		playerScore = 0;
	}
	if (playerScore == 5) {
		playerSelector.classList.remove('bracket-loser');
		playerSelector.classList.add('bracket-winner');
	}
	else {
		playerSelector.classList.remove('bracket-winner');
		playerSelector.classList.add('bracket-loser');
	}
	playerSelector.insertAdjacentHTML('beforeend', `\
	<div class="bracket-player-picture">
		<img src="` + userPic + `" alt="profile picture of ` + playerAlias + `" draggable="false" (dragstart)="false;" class="unselectable">
	</div>
	<div class="bracket-player-name unselectable">` + playerAlias + `</div>
	<div class="bracket-player-score unselectable">` + playerScore + `</div>`);
}

async function loadTournamentInfoInvites() {
	try {
		var	availableFriends = await get_available_friends();
		availableFriends = availableFriends.Ava;
		var	friendsContainer = document.querySelector('.tournament-info-invite');

		document.querySelector('.tournament-info-no-friends').classList.add('visually-hidden');

		for (i = 0; i < availableFriends.length; i++) {
			userPic = availableFriends[i].Pic;
			if (userPic == null) {
				userPic = 'assets/general/pong.png';
			}

			friendsContainer.insertAdjacentHTML('beforeend', `\
			<button class="content-card w-100 flex-shrink-0 d-flex justify-content-between align-items-center purple-shadow" user-id="` + availableFriends[i].Id + `">
				<div class="user-card-name unselectable">` + availableFriends[i].Nick + `</div>
				<div class="user-card-picture">
					<img src="` + userPic + `" alt="profile picture of ` + availableFriends[i].Nick + `" draggable="false" (dragstart)="false;" class="unselectable">
				</div>
			</button>`);
		}
		// if no friend available
		if (availableFriends.length == 0) {
			document.querySelector('.tournament-info-no-friends').classList.remove('visually-hidden');
		}
	} catch (error) {
		console.error(error);
		document.querySelector('.tournament-info-no-friends').classList.remove('visually-hidden');
	}

	// Invite a friend in the list

	document.querySelectorAll('.tournament-info-invite .content-card').forEach(function(item) {
		item.addEventListener('click', function () {
			var	invitedId = item.getAttribute('user-id');
			var invitedNick = item.querySelector('.user-card-name').textContent;
			var	invitedPic = item.querySelector('.user-card-picture img').getAttribute('src');

			// Show alert
			document.querySelector('.tournament-info-invite-alert').classList.remove('visually-hidden');
			setAriaHidden();
			document.querySelector('.tournament-info-invite-alert .alert-confirm-button').focus();

			// Confirm the invite
			document.querySelector('.tournament-info-invite-alert .alert-confirm-button').addEventListener('click', function () {
				if (invitedNick) {
					addInvitedPlayerToTournament(invitedId, invitedNick, invitedPic);
					invitedNick = null;

					removeItemFromFriendsList(item);
				}
			});
			document.querySelector('.tournament-info-invite-alert .alert-confirm-button').addEventListener('keypress', function (event) {
				if (event.key === 'Enter' && invitedNick) {
					addInvitedPlayerToTournament(invitedId, invitedNick, invitedPic);
					invitedNick = null;

					removeItemFromFriendsList(item);
				}
			});

			// Cancel the invite
			document.querySelector('.tournament-info-invite-alert .alert-cancel-button').addEventListener('click', function () {
				cancelInviteFriendToTournament();
				invitedNick = null;
			});
			document.querySelector('.tournament-info-invite-alert .alert-cancel-button').addEventListener('keypress', function (event) {
				if (event.key === 'Enter') {
					cancelInviteFriendToTournament();
					invitedNick = null;
				}
			});

			// Click outside the alert to cancel
			document.querySelector('.tournament-info-invite-alert').addEventListener('click', function (event) {
				if (this !== event.target) {
					return ;
				}
				invitedNick = null;
			});
		});
	});
}

function clearTournamentInfoInvites() {
	// clear available friends list
	document.querySelectorAll('.tournament-info-invite .content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});
}

function clearTournamentInfo() {
	clearTournamentInfoInvites();

	// remove players content cards
	document.querySelectorAll('.tournament-info-players .content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});

	// clear bracket
	document.querySelectorAll('.bracket-player').forEach(function(item) {
		item.innerHTML = '';
	});
}

// Hide when clicking top left button

document.querySelector('.tournament-info-icon').addEventListener('click', async function() {
	document.querySelector('.tournament-info').classList.add('visually-hidden');

	await clearHomepageContent();
	await setHomepageContent();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

async function loadUserProfile(id) {
	if (id == null) {
		return ;
	}

	clearUserContent();
	await loadUserContent(id);

	hideEveryPage();

	g_state.pageToDisplay = '.user-profile';
	window.history.pushState(g_state, null, "");
	render(g_state);
}

// Ask for confirmation when joining tournament

document.querySelector('.tournament-info-join-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info-join-alert').classList.remove('visually-hidden');
	setAriaHidden();

	document.querySelector('.tournament-info-join-input').value = g_userNick;
	document.querySelector('.tournament-info-join-input').focus();
});

	// Confirm / cancel the invitation

document.querySelector('.tournament-info-join-input').addEventListener('input', function() {
	if (this.value.length > 0) {
		document.querySelector('.tournament-info-join-input-warning').classList.add('visually-hidden');
		setAriaHidden();
	}
});

function checkTournamentNick(nick, warning) {
	if (nick.length == 0) {
		return true;
	}
	return (warnInvalidNickname(nick, warning));
}

document.querySelector('.tournament-info-join-alert .alert-confirm-button').addEventListener('click', function() {
	confirmJoinTournament();
});

document.querySelector('.tournament-info-join-input').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		confirmJoinTournament();
	}
});

async function confirmJoinTournament() {
	var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');
	var	tournamentNick = document.querySelector('.tournament-info-join-input').value;
	var	warning = document.querySelector('.tournament-info-join-input-warning');

	if (!checkTournamentNick(tournamentNick, warning)) {
		var locale = document.querySelector('.homepage-header-language-selector button img').alt;
		switchLanguageContent(locale);
		warning.classList.remove('visually-hidden');
		setAriaHidden();
		return ;
	}

	try {
		await join_tournament(tournamentId, tournamentNick);
	} catch (error) {
		console.error();
		return ;
	}

	document.querySelector('.tournament-info-join-alert').classList.add('visually-hidden');

	document.querySelector('.tournament-info-join-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-leave-icon').classList.remove('visually-hidden');
	document.querySelector('.tournament-info-leave-icon').focus();

	// Set tournamentId for future victory-defeat screen
	document.querySelector('.victory-defeat-tournament').setAttribute('tournament-id', tournamentId);

	await loadOngoingTournament(tournamentId);

	hideEveryPage();
	g_state.pageToDisplay = '.tournament-info';
	window.history.pushState(g_state, null, "");
	render(g_state);
}

document.querySelector('.tournament-info-join-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-join-alert').classList.add('visually-hidden');
	setAriaHidden();
});

// Ask for confirmation when leaving tournament

document.querySelector('.tournament-info-leave-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info-leave-alert').classList.remove('visually-hidden');
	setAriaHidden();
	document.querySelector('.tournament-info-leave-alert .alert-confirm-button').focus();
});

	// Confirm / cancel the leaving

document.querySelector('.tournament-info-leave-alert .alert-confirm-button').addEventListener('click', async function () {
	document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');

	document.querySelector('.tournament-info-leave-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-join-icon').classList.remove('visually-hidden');
	document.querySelector('.tournament-info-join-icon').focus();

	var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');

	await remove_player_from_tournament(tournamentId, g_userId);

	setAriaHidden();
});

document.querySelector('.tournament-info-leave-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');
	setAriaHidden();
});

// Enter edit mode

document.querySelector('.tournament-info-edit-icon').addEventListener('click', function () {
	// Switch button appearance
	document.querySelector('.tournament-info-edit-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-check-icon').classList.remove('visually-hidden');

	// Hide tournament name
	document.querySelector('.tournament-info-name').classList.add('visually-hidden');

	// Reveal edit tournament name with tournament name as default value
	var	tournamentName = document.querySelector('.tournament-info-name').textContent;
	var tournamentNameInput = document.querySelector('.tournament-info-name-input');

	tournamentNameInput.value = tournamentName;
	document.querySelector('.tournament-info-name-input-container').classList.remove('visually-hidden');
	tournamentNameInput.focus();
	setAriaHidden();
});

// Kick a player

document.querySelectorAll('.tournament-kick-player').forEach(function(item) {
	item.addEventListener('click', function(event) {
		event.stopPropagation();

		kickPlayer(item);
	});
});

document.querySelectorAll('.tournament-kick-player').forEach(function(item) {
	item.addEventListener('keypress', function(event) {
		if (event.key == 'Enter') {
			event.stopPropagation();

			kickPlayer(item);
		}
	});
});

function kickPlayer(item) {
	var playerToHide = item.parentNode;

	// Show alert
	document.querySelector('.tournament-info-kick-alert').classList.remove('visually-hidden');
	document.querySelector('.tournament-info-kick-alert .alert-confirm-button').focus();

	// Confirm the kick
	document.querySelector('.tournament-info-kick-alert .alert-confirm-button').addEventListener('click', async function () {
		await confirmKick(playerToHide);
	});
	document.querySelector('.tournament-info-kick-alert .alert-confirm-button').addEventListener('keypress', async function(event) {
		if (event.key === 'Enter') {
			await confirmKick(playerToHide);
		}
	});

	// Cancel the kick
	document.querySelector('.tournament-info-kick-alert .alert-cancel-button').addEventListener('click', function () {
		// Hide alert
		document.querySelector('.tournament-info-kick-alert').classList.add('visually-hidden');

		playerToHide = null;
	});
	document.querySelector('.tournament-info-kick-alert .alert-cancel-button').addEventListener('keypress', function (event) {
		if (event.key === 'Enter') {
			// Hide alert
			document.querySelector('.tournament-info-kick-alert').classList.add('visually-hidden');

			playerToHide = null;
		}
	});

	// Click outside the alert to cancel
	document.querySelector('.tournament-info-kick-alert').addEventListener('click', function (event) {
		if (this !== event.target) {
			return ;
		}
		playerToHide = null;
	});

	setAriaHidden();
}

async function confirmKick(playerToHide) {
	try {
		await remove_player_from_tournament(tournamentId, playerId);
	} catch (error) {
		console.error(error);
		return ;
	}

	// Hide alert
	document.querySelector('.tournament-info-kick-alert').classList.add('visually-hidden');

	var playerId = playerToHide.getAttribute('user-id');
	var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');

	// Remove player
	if (playerToHide && playerToHide.parentNode) {
		playerToHide.parentNode.removeChild(playerToHide);
	}
}

// Leave edit mode

function checkToLeaveTournamentEditMode() {
	// Check if new tournament name is correct
	var	tournamentNameInput = document.querySelector('.tournament-info-name-input');
	var	tournamentInputWarning = document.querySelector('.tournament-info-name-input-warning');

	if (!warnInvalidTournamentName(tournamentNameInput.value, tournamentInputWarning)) {
		// Show warning
		var locale = document.querySelector('.homepage-header-language-selector button img').alt;
		switchLanguageContent(locale);
		tournamentInputWarning.classList.remove('visually-hidden');
	}
	else {
		// Show alert
		document.querySelector('.tournament-info-edit-alert').classList.remove('visually-hidden');
		document.querySelector('.tournament-info-edit-alert .alert-confirm-button').focus();
	}
	setAriaHidden();
}

// Leave edit mode using button
document.querySelector('.tournament-info-check-icon').addEventListener('click', function () {
	checkToLeaveTournamentEditMode();
});

// Leave edit mode using enter key

document.querySelector('.tournament-info-name-input').addEventListener('keypress', function(event) {
	if (event.key === 'Enter') {
		checkToLeaveTournamentEditMode();
	}
});

// Confirm / cancel the leaving

document.querySelector('.tournament-info-edit-alert .alert-confirm-button').addEventListener('click', async function () {
	await changeTournamentName();
	leaveTournamentEditMode();
});

document.querySelector('.tournament-info-edit-alert .alert-confirm-button').addEventListener('keypress', async function (event) {
	if (event.key === 'Enter') {
		await changeTournamentName();
		leaveTournamentEditMode();
	}
});

async function changeTournamentName() {
	var	tournamentNameInput = document.querySelector('.tournament-info-name-input');
	var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');
	
	try {
		await change_tournament_name(tournamentNameInput.value, tournamentId);
	} catch (error) {
		console.error();
		return ;
	}
	
	// Hide alert
	document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
	setAriaHidden();
	
	// Update tournament name
	document.querySelector('.tournament-info-name').textContent = tournamentNameInput.value;
}

document.querySelector('.tournament-info-edit-alert .alert-cancel-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
	setAriaHidden();
});

document.querySelector('.tournament-info-edit-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		// Hide alert
		document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
		setAriaHidden();
	}
});

// Open list of friends to invite

document.querySelector('.tournament-info-invite-icon').addEventListener('click', function () {
	document.querySelector('.tournament-info-invite-box').classList.toggle('visually-hidden');

	if (document.querySelector('.tournament-info-no-friends').classList.contains('visually-hidden')) {
		document.querySelector('.tournament-info-invite button').focus();
	}
	setAriaHidden();
});

// Close friends list on click outside

function isFriendsList(target) {
	var	temp = target;
	if (target.classList && target.classList.contains('tournament-info-invite-box')) {
		return true;
	}
	while(target.parentNode && target.parentNode.nodeName.toLowerCase() != 'body') {
		var	parentClassList = target.parentNode.classList;
		if (parentClassList && parentClassList.contains('tournament-info-invite-box')) {
			return true;
		}
		target = target.parentNode;
	}
	target = temp;
	if (target.classList && target.classList.contains('tournament-info-invite-icon')) {
		return true;
	}
	while(target.parentNode && target.parentNode.nodeName.toLowerCase() != 'body') {
		var	parentClassList = target.parentNode.classList;
		if (parentClassList && parentClassList.contains('tournament-info-invite-icon')) {
			return true;
		}
		target = target.parentNode;
	}
	target = temp;
	if (target.classList && target.classList.contains('tournament-info-invite-alert')) {
		return true;
	}
	while(target.parentNode && target.parentNode.nodeName.toLowerCase() != 'body') {
		var	parentClassList = target.parentNode.classList;
		if (parentClassList && parentClassList.contains('tournament-info-invite-alert')) {
			return true;
		}
		target = target.parentNode;
	}
	return false;
}

window.addEventListener('click', function ({target}){
	if (!isFriendsList(target)) {
		document.querySelector('.tournament-info-invite-box').classList.add('visually-hidden');
		setAriaHidden();
	}
});

function cancelInviteFriendToTournament() {
	// Hide alert
	document.querySelector('.tournament-info-invite-alert').classList.add('visually-hidden');
	setAriaHidden();
}

async function addInvitedPlayerToTournament(id, nick, pic) {
	try {
		// Send invite through Coubertin
		var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');
		await invite_friend_to_tournament(tournamentId, id);
	} catch (error) {
		console.error(error);
		return ;
	}

	// Hide alert
	document.querySelector('.tournament-info-invite-alert').classList.add('visually-hidden');

	// Create player card
	var playersList = document.querySelector('.tournament-info-players');

	playersList.insertAdjacentHTML('beforeend', `\
    <button class="content-card invite-pending d-flex justify-content-between align-items-center purple-shadow" user-id="` + id + `">
        <div class="d-flex flex-nowrap align-items-center">
            <div class="user-card-name unselectable">`+ nick + `</div>
            <div class="user-card-pending" data-language="pending">(pending...)</div>
        </div>
        <div class="user-card-picture">
            <img src="` + pic + `" alt="profile picture of `+ nick + `" draggable="false" (dragstart)="false;" class="unselectable">
        </div>
        <div class="tournament-kick-player d-flex justify-content-center align-items-center position-absolute visually-hidden">
            <img src="assets/general/remove-black.svg" alt="kick player" draggable="false" (dragstart)="false;" class="unselectable">
        </div>
    </button>`);

	document.querySelectorAll('.tournament-info-players .content-card').forEach(function(item) {
		item.addEventListener('click', async function(event) {
			var userId = await event.target.getAttribute('user-id');
			if (userId == null) {
				setTimeout(async () => {
					userId = await event.target.getAttribute('user-id');
				}, 500);
			}
			await loadUserProfile(userId);
		});
	});

	if (!document.querySelector('.tournament-info-no-players').classList.contains('visually-hidden')) {
		document.querySelector('.tournament-info-no-players').classList.add('visually-hidden');
	}

	setAriaHidden();
}

function removeItemFromFriendsList(item) {
	if (item.parentNode.children.length == 2) {
		document.querySelector('.tournament-info-no-friends').classList.remove('visually-hidden');
		document.querySelector('.tournament-info-invite-box').style.minHeight = "40vh";
		document.querySelector('.tournament-info-invite').style.minHeight = "40vh";
		document.querySelector('.tournament-info-invite-box').classList.add('visually-hidden');
	}
	item.parentNode.removeChild(item);
	setAriaHidden();
}

// Keyboard navigation

async function tournamentInfoKeyboardNavigation(e, tournamentInfo, ongoing) {
	let isFw =!e.shiftKey;

	if (!document.querySelector('.tournament-info').classList.contains('visually-hidden')) {
		var	firstPlayerCard = document.querySelector('.tournament-info-players button');
		var	lastPlayerCard = document.querySelector('.tournament-info-players').lastElementChild;
		var firstInviteCard = document.querySelector('.tournament-info-invite button');
		var	lastInviteCard = document.querySelector('.tournament-info-invite').lastElementChild;

		var confirmedPlayers = [];
		var	pendingPlayers = [];
		var	isOwner = false;
		var	hasJoined = false;

		if (ongoing) {
			if (tournamentInfo.Owner == g_userId) {
				isOwner = true;
			}

			confirmedPlayers = tournamentInfo.Confirmed;
			pendingPlayers = tournamentInfo.Pending;
			for (i = 0; i < confirmedPlayers.length; i++) {
				if (confirmedPlayers[i] == g_userId) {
					hasJoined = true;
					break ;
				}
			}
		}
		else {
			confirmedPlayers = tournamentInfo.Players;
		}

		// tournament icon -> next
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-icon')) {
			if (ongoing) {
				if (isOwner) {
					document.querySelector('.tournament-info-edit-icon').focus();
				}
				else if (hasJoined) {
					document.querySelector('.tournament-info-invite-icon').focus();
				}
				else {
					document.querySelector('.tournament-info-join-icon').focus();
				}
			}
			else if (firstPlayerCard) {
				firstPlayerCard.focus();
			}
			else {
				document.querySelector('.tournament-info-icon').focus();
			}
			e.preventDefault();
			return ;
		}
		if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-icon')) {
			if (ongoing) {
				if (lastPlayerCard) {
					lastPlayerCard.focus();
				}
				else if (hasJoined) {
					document.querySelector('.tournament-info-leave-icon').focus();
				}
				else {
					document.querySelector('.tournament-info-join-icon').focus();
				}
			}
			else {
				lastPlayerCard.focus();
			}
			e.preventDefault();
			return ;
		}

		// join -> first player card
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-join-icon')) {
			if (firstPlayerCard) {
				firstPlayerCard.focus();
				e.preventDefault();
				return ;
			}
		}
		// leave -> first player card
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-leave-icon')) {
			if (firstPlayerCard) {
				firstPlayerCard.focus();
				e.preventDefault();
				return ;
			}
		}
		// first player card -> join / leave
		if (e.key == 'Tab' && !isFw && firstPlayerCard && document.activeElement === firstPlayerCard) {
			if (hasJoined) {
				document.querySelector('.tournament-info-leave-icon').focus();
			}
			else {
				document.querySelector('.tournament-info-join-icon').focus();
			}
			e.preventDefault();
			return ;
		}

		// join -> previous
		if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-join-icon')) {
			if (isOwner || hasJoined) {
				document.querySelector('.tournament-info-invite-icon').focus();
			}
			else {
				document.querySelector('.tournament-info-icon').focus();
			}
			e.preventDefault();
			return ;
		}
		// leave -> previous
		if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-leave-icon')) {
			if (isOwner || hasJoined) {
				document.querySelector('.tournament-info-invite-icon').focus();
			}
			else {
				document.querySelector('.tournament-info-icon').focus();
			}
			e.preventDefault();
			return ;
		}

		if (isOwner) {
			if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-invite-icon')) {
				document.querySelector('.tournament-info-edit-icon').focus();
				e.preventDefault();
				return ;
			}
		}

		if (isOwner) {
			if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-edit-icon')) {
				document.querySelector('.tournament-info-icon').focus();
				e.preventDefault();
				return ;
			}
		}

		// input -> check (if you are owner)
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-name-input')) {
				document.querySelector('.tournament-info-check-icon').focus();
				e.preventDefault();
				return ;
		}

		// invite -> join / leave
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-invite-icon')) {
			if (hasJoined) {
				document.querySelector('.tournament-info-leave-icon').focus();
			}
			else {
				document.querySelector('.tournament-info-join-icon').focus();
			}
			e.preventDefault();
			return ;
		}
		// last invite -> first invite
		if (e.key == 'Tab' && isFw && document.activeElement === lastInviteCard) {
			if (document.querySelector('.tournament-info-no-friends').classList.contains('visually-hidden')) {
				firstInviteCard.focus();
				e.preventDefault();
				return ;
			}
		}
		// first invite -> last invite
		if (document.querySelector('.tournament-info-no-friends').classList.contains('visually-hidden')) {
			if (e.key == 'Tab' && !isFw && document.activeElement === firstInviteCard) {
				lastInviteCard.focus();
				e.preventDefault();
				return ;
			}
		}
		// leave invite window
		if (e.key == 'Escape' && document.activeElement.parentElement.classList.contains('tournament-info-invite')) {
			document.querySelector('.tournament-info-invite').classList.add('visually-hidden');
			setAriaHidden();
			document.querySelector('.tournament-info-invite-icon').focus();
			e.preventDefault();
			return ;
		}

		// if you are the owner (kick icons)
		if (e.key == 'Tab' && isFw && document.activeElement === lastPlayerCard.querySelector('.tournament-kick-player')) {
			document.querySelector('.tournament-info-icon').focus();
			e.preventDefault();
			return ;
		}
		else
		if (e.key == 'Tab' && isFw && document.activeElement === lastPlayerCard) {
			document.querySelector('.tournament-info-icon').focus();
			e.preventDefault();
			return ;
		}

	}

	// Alerts
	if (e.key == 'Tab' && isFw && document.activeElement.classList.contains('alert-cancel-button')) {
		if (document.activeElement.parentElement.parentElement.querySelector('.tournament-info-join-input-container')) {
			document.querySelector('.tournament-info-join-input').focus();
		}
		else {
			document.activeElement.parentElement.querySelector('.alert-confirm-button').focus();
		}
		e.preventDefault();
		return ;
	}
	if (e.key == 'Tab' && !isFw && document.activeElement.classList.contains('alert-confirm-button')) {
		if (document.activeElement.parentElement.parentElement.querySelector('.tournament-info-join-input-container')) {
			document.querySelector('.tournament-info-join-input').focus();
		}
		else {
			document.activeElement.parentElement.querySelector('.alert-cancel-button').focus();
		}
		e.preventDefault();
		return ;
	}
	if (e.key == 'Tab' && !isFw && document.activeElement.classList.contains('tournament-info-join-input')) {
		var	nearestCancel = document.activeElement.parentElement.parentElement.parentElement;
		nearestCancel.querySelector('.alert-cancel-button').focus();
		e.preventDefault();
		return ;
	}
	if (e.key == 'Escape' && (document.activeElement.parentElement.classList.contains('alert-buttons-container') ||
		document.activeElement.classList.contains('tournament-info-join-input'))) {

		var	nearestAlert = document.activeElement.parentElement;

		while (!nearestAlert.classList.contains('alert')) {
			nearestAlert = nearestAlert.parentElement;
		}

		nearestAlert.classList.add('visually-hidden');
		setAriaHidden();
	}
}
