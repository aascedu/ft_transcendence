// Load tournament info from db

function loadTournamentInfo(id) {
	// var	tournamentInfo = get tournament info from db (id)
	
	// // Display tournament name
	// document.querySelector('.tournament-info-name').textContent = tournamentInfo.Name;

	// // Display online friends that aren't already invited to tournament
	// var	availableFriends = get available friends from db (g_userId)
	// var	friendsContainer = document.querySelector('.tournament-info-invite');
	// var	userInfo;

	// document.querySelector('.tournament-info-no-friends').classList.add('visually-hidden');

	// for (i = 0; i < availableFriends.length; i++) {
	// 	userInfo = get_user_info(availableFriends[i]);

	// 	friendsContainer.insertAdjacentHTML('beforeend', `\
	// 	<button class="content-card w-100 flex-shrink-0 d-flex justify-content-between align-items-center purple-shadow" user-id="` + availableFriends[i] + `">
	// 		<div class="user-card-name unselectable">` + userInfo.Nick + `</div>
	// 		<div class="user-card-picture">
	// 			<img src="` + userInfo.Pic + `" alt="profile picture of ` + userInfo.Nick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 	</button>`);
	// }
	// // if no friend available
	// if (availableFriends.length == 0) {
	// 	document.querySelector('.tournament-info-no-friends').classList.remove('visually-hidden');
	// }

	// // Display players
	// var	confirmedPlayers = tournamentInfo.Confirmed;
	// var	pendingPlayers = tournamentInfo.Pending;
	// var	playersContainer = document.querySelector('.tournament-info-players');

	// // If no player at all
	// if (confirmedPlayers.length == 0 && pendingPlayers.length == 0) {
	// 	document.querySelector('.tournament-info-no-players').classList.remove('visually-hidden');
	// 	return ;
	// }

	// document.querySelector('.tournament-info-no-players').classList.add('visually-hidden');

	// // Display number of players
	// document.querySelector('.tournament-info-players-num').textContent = confirmedPlayers.length + '/' + tournamentInfo.NumPlayers;

	// // Display players that are confirmed
	// for (i = 0; i < confirmedPlayers.length; i++) {
	// 	userInfo = get_user_info(confirmedPlayers[i]);

	// 	playersContainer.insertAdjacentHTML('beforeend', `\
	// 	<button class="content-card d-flex justify-content-between align-items-center purple-shadow" user-id="` + confirmedPlayers[i] + `">
	// 		<div class="user-card-name unselectable">` + userInfo.Nick + `</div>
	// 		<div class="user-card-picture">
	// 			<img src="` + userInfo.Pic + `" alt="profile picture of ` + userInfo.Nick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 		<div class="tournament-kick-player d-flex justify-content-center align-items-center position-relative visually-hidden" tabindex="0">
	// 			<img src="assets/general/remove-black.svg" alt="kick player" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 	</button>`);
	// }

	// // Display invited players that haven't joined (pending)
	// for (i = 0; i < pendingPlayers.length; i++) {
	// 	userInfo = get_user_info(pendingPlayers[i]);

	// 	playersContainer.insertAdjacentHTML('beforeend', `\
	// 	<button class="content-card invite-pending d-flex justify-content-between align-items-center purple-shadow" user-id="` + pendingPlayers[i] + `">
	// 		<div class="d-flex flex-nowrap align-items-center">
	// 			<div class="user-card-name unselectable">`+ userInfo.Nick + `</div>
	// 			<div class="user-card-pending" data-language="pending">(pending...)</div>
	// 		</div>
	// 		<div class="user-card-picture">
	// 			<img src="` + userInfo.Pic + `" alt="profile picture of `+ userInfo.Nick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 		<div class="tournament-kick-player d-flex justify-content-center align-items-center position-absolute visually-hidden">
	// 			<img src="assets/general/remove-black.svg" alt="kick player" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 	</button>`);
	// }

	// // Display tournament bracket if ongoing
	// if (tournamentInfo.Ongoing == true) {
	// 	var	bracket = tournamentInfo.Bracket;
	// 	var	round;
	// 	var	matchs;
	// 	var	score;

	// 	if (tournamentInfo.NumPlayers == 4) {
	// 		// Display 4 players bracket
	// 		if (document.querySelector('.bracket-round-two') != null) {
	// 			document.querySelector('.bracket-round-one').classList.add('visually-hidden');
	// 			document.querySelector('.bracket-round-two').classList.add('bracket-round-one');
	// 			document.querySelector('.bracket-round-two').classList.add('bracket-round-one-four');
	// 			document.querySelector('.bracket-round-two').classList.remove('bracket-round-two');
	// 		}
	// 		document.querySelector('.bracket-round-three').classList.add('bracket-round-three-four');

	// 		// Load info

	// 		// Round one (semifinals)
	// 		round = document.querySelector('.bracket-round-one-four');
	// 		matchs = round.querySelectorAll('.bracket-match');

	// 		for (i = 0; i < 2; i++) {
	// 			if (bracket.RoundOne[i].Players == null) {
	// 				return ;
	// 			}

	// 			// fill info for player 1
	// 			userNick = bracket.RoundOne[i].Players[0].Nick;
	// 			userPic = bracket.RoundOne[i].Players[0].Pic;
	// 			score = bracket.RoundOne[i].Score[0];
	// 			if (score == null) {
	// 				score = 0;
	// 			}
	// 			if (score == 5) {
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-loser');
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-loser');
	// 			}
	// 			matchs[i].querySelectorAll('.bracket-player')[0].insertAdjacentHTML('beforeend', `\
	// 			<div class="bracket-player-picture">
	// 				<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 			</div>
	// 			<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 			<div class="bracket-player-score unselectable">` + score + `</div>`);

	// 			// fill info for player 2
	// 			userNick = bracket.RoundOne[i].Players[1].Nick;
	// 			userPic = bracket.RoundOne[i].Players[1].Pic;
	// 			score = bracket.RoundOne[i].Score[1];
	// 			if (score == null) {
	// 				score = 0;
	// 			}
	// 			if (score == 5) {
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-loser');
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-loser');
	// 			}
	// 			matchs[i].querySelectorAll('.bracket-player')[1].insertAdjacentHTML('beforeend', `\
	// 			<div class="bracket-player-picture">
	// 				<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 			</div>
	// 			<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 			<div class="bracket-player-score unselectable">` + score + `</div>`);
	// 		}

	// 		// Round two (final)
	// 		round = document.querySelector('.bracket-round-three-four');
	// 		matchs = round.querySelector('.bracket-match');

	// 		if (bracket.RoundTwo[0].Players == null) {
	// 			return ;
	// 		}

	// 		// fill info for player 1

	// 		userNick = bracket.RoundTwo[0].Players[0].Nick;
	// 		userPic = bracket.RoundTwo[0].Players[0].Pic;
	// 		score = bracket.RoundTwo[0].Score[0];
	// 		if (score == null) {
	// 			score = 0;
	// 		}
	// 		if (score == 5) {
	// 			matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-loser');
	// 			matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-winner');
	// 			matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-winner');
	// 			matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-loser');
	// 		}
	// 		matchs.querySelectorAll('.bracket-player')[0].insertAdjacentHTML('beforeend', `\
	// 		<div class="bracket-player-picture">
	// 			<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 		<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 		<div class="bracket-player-score unselectable">` + score + `</div>`);

	// 		// fill info for player 2
	// 		userNick = bracket.RoundTwo[0].Players[1].Nick;
	// 		userPic = bracket.RoundTwo[0].Players[1].Pic;
	// 		score = bracket.RoundTwo[0].Score[1];
	// 		if (score == null) {
	// 			score = 0;
	// 		}
	// 		if (score == 5) {
	// 			matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-loser');
	// 			matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-winner');
	// 			matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-winner');
	// 			matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-loser');
	// 		}
	// 		matchs.querySelectorAll('.bracket-player')[1].insertAdjacentHTML('beforeend', `\
	// 		<div class="bracket-player-picture">
	// 			<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 		<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 		<div class="bracket-player-score unselectable">` + score + `</div>`);
	// 	}
	// 	else {
	// 		// Display 8 players bracket if needed
	// 		if (document.querySelector('.bracket-round-one-four') != null) {
	// 			document.querySelector('.bracket-round-one').classList.remove('visually-hidden');
	// 			document.querySelector('.bracket-round-one-four').classList.add('bracket-round-two');
	// 			document.querySelector('.bracket-round-one-four').classList.remove('bracket-round-one');
	// 			document.querySelector('.bracket-round-one-four').classList.remove('bracket-round-one-four');
	// 			document.querySelector('.bracket-round-three-four').classList.remove('bracket-round-three-four');
	// 		}

	// 		// Load info

	// 		// Round one (quarterfinals)
	// 		round = document.querySelector('.bracket-round-one');
	// 		matchs = round.querySelectorAll('.bracket-match');

	// 		for (i = 0; i < 4; i++) {
	// 			if (bracket.RoundOne[i].Players == null) {
	// 				return ;
	// 			}
	// 			// fill info for player 1
	// 			userNick = bracket.RoundOne[i].Players[0].Nick;
	// 			userPic = bracket.RoundOne[i].Players[0].Pic;
	// 			score = bracket.RoundOne[i].Score[0];
	// 			if (score == null) {
	// 				score = 0;
	// 			}
	// 			if (score == 5) {
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-loser');
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-loser');
	// 			}
	// 			matchs[i].querySelectorAll('.bracket-player')[0].insertAdjacentHTML('beforeend', `\
	// 			<div class="bracket-player-picture">
	// 				<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 			</div>
	// 			<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 			<div class="bracket-player-score unselectable">` + score + `</div>`);

	// 			// fill info for player 2
	// 			userNick = bracket.RoundOne[i].Players[1].Nick;
	// 			userPic = bracket.RoundOne[i].Players[1].Pic;
	// 			score = bracket.RoundOne[i].Score[1];
	// 			if (score == null) {
	// 				score = 0;
	// 			}
	// 			if (score == 5) {
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-loser');
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-loser');
	// 			}
	// 			matchs[i].querySelectorAll('.bracket-player')[1].insertAdjacentHTML('beforeend', `\
	// 			<div class="bracket-player-picture">
	// 				<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 			</div>
	// 			<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 			<div class="bracket-player-score unselectable">` + score + `</div>`);
	// 		}

	// 		// Round two (semifinals)
	// 		round = document.querySelector('.bracket-round-two');
	// 		matchs = round.querySelectorAll('.bracket-match');

	// 		for (i = 0; i < 2; i++) {
	// 			if (bracket.RoundTwo[i].Players == null) {
	// 				return ;
	// 			}

	// 			// fill info for player 1
	// 			userNick = bracket.RoundTwo[i].Players[0].Nick;
	// 			userPic = bracket.RoundTwo[i].Players[0].Pic;
	// 			score = bracket.RoundTwo[i].Score[0];
	// 			if (score == null) {
	// 				score = 0;
	// 			}
	// 			if (score == 5) {
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-loser');
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-loser');
	// 			}
	// 			matchs[i].querySelectorAll('.bracket-player')[0].insertAdjacentHTML('beforeend', `\
	// 			<div class="bracket-player-picture">
	// 				<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 			</div>
	// 			<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 			<div class="bracket-player-score unselectable">` + score + `</div>`);

	// 			// fill info for player 2
	// 			userNick = bracket.RoundTwo[i].Players[1].Nick;
	// 			userPic = bracket.RoundTwo[i].Players[1].Pic;
	// 			score = bracket.RoundTwo[i].Score[1];
	// 			if (score == null) {
	// 				score = 0;
	// 			}
	// 			if (score == 5) {
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-loser');
	// 				matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-winner');
	// 				matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-loser');
	// 			}
	// 			matchs[i].querySelectorAll('.bracket-player')[1].insertAdjacentHTML('beforeend', `\
	// 			<div class="bracket-player-picture">
	// 				<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 			</div>
	// 			<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 			<div class="bracket-player-score unselectable">` + score + `</div>`);
	// 		}

	// 		// Round three (final)
	// 		round = document.querySelector('.bracket-round-three-four');
	// 		matchs = round.querySelector('.bracket-match');

	// 		if (bracket.RoundThree[0].Players == null) {
	// 			return ;
	// 		}

	// 		// fill info for player 1
	// 		userNick = bracket.RoundThree[0].Players[0].Nick;
	// 		userPic = bracket.RoundThree[0].Players[0].Pic;
	// 		score = bracket.RoundThree[0].Score[0];
	// 		if (score == null) {
	// 			score = 0;
	// 		}
	// 		if (score == 5) {
	// 			matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-loser');
	// 			matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-winner');
	// 			matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-winner');
	// 			matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-loser');
	// 		}
	// 		matchs.querySelectorAll('.bracket-player')[0].insertAdjacentHTML('beforeend', `\
	// 		<div class="bracket-player-picture">
	// 			<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 		<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 		<div class="bracket-player-score unselectable">` + score + `</div>`);

	// 		// fill info for player 2
	// 		userNick = bracket.RoundThree[0].Players[1].Nick;
	// 		userPic = bracket.RoundThree[0].Players[1].Pic;
	// 		score = bracket.RoundThree[0].Score[1];
	// 		if (score == null) {
	// 			score = 0;
	// 		}
	// 		if (score == 5) {
	// 			matchs[i].querySelectorAll('.bracket-player')[1].classList.remove('bracket-loser');
	// 			matchs[i].querySelectorAll('.bracket-player')[1].classList.add('bracket-winner');
	// 			matchs[i].querySelectorAll('.bracket-player')[0].classList.remove('bracket-winner');
	// 			matchs[i].querySelectorAll('.bracket-player')[0].classList.add('bracket-loser');
	// 		}
	// 		matchs.querySelectorAll('.bracket-player')[1].insertAdjacentHTML('beforeend', `\
	// 		<div class="bracket-player-picture">
	// 			<img src="` + userPic + `" alt="profile picture of ` + userNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 		<div class="bracket-player-name unselectable">` + userNick + `</div>
	// 		<div class="bracket-player-score unselectable">` + score + `</div>`);
	// 	}
	// }
}

// Hide when clicking top left button

document.querySelector('.tournament-info-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load user profile page when clicking on a player

document.querySelectorAll('.tournament-info-players .content-card').forEach(function(item) {
	item.addEventListener('click', loadUserProfile(item.getAttribute('user-id')));
});

function loadUserProfile(id) {
	if (id == g_userId) {
		document.querySelector('.user-profile-picture-input').focus();
	}
	// else if user is your friend
	// document.querySelector('.user-profile-remove-icon').focus();
	else {
		document.querySelector('.user-profile-add-icon').focus();
	}

	clearUserContent();
	loadUserContent(id);

	hideEveryPage();

	g_state.pageToDisplay = '.user-profile';
	window.history.pushState(g_state, null, "");
	render(g_state);
}

// Ask for confirmation when joining tournament

document.querySelector('.tournament-info-join-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info-join-alert').classList.remove('visually-hidden');
	setAriaHidden();

	document.querySelector('.tournament-info-join-input').value = 'cha'; // replace with user nick
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
	var	tournamentNick = document.querySelector('.tournament-info-join-input').value;
	var	warning = document.querySelector('.tournament-info-join-input-warning');

	if (!checkTournamentNick(tournamentNick, warning)) {
		var locale = document.querySelector('.homepage-header-language-selector button img').alt;
		switchLanguageContent(locale);
		warning.classList.remove('visually-hidden');
		setAriaHidden();
		return ;
	}

	document.querySelector('.tournament-info-join-alert').classList.add('visually-hidden');

	document.querySelector('.tournament-info-join-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-leave-icon').classList.remove('visually-hidden');
	document.querySelector('.tournament-info-leave-icon').focus();

	await loadTournamentInfo();

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

document.querySelector('.tournament-info-leave-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');

	document.querySelector('.tournament-info-leave-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-join-icon').classList.remove('visually-hidden');
	document.querySelector('.tournament-info-join-icon').focus();
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
	document.querySelector('.tournament-info-kick-alert .alert-confirm-button').addEventListener('click', function () {
		// Hide alert
		document.querySelector('.tournament-info-kick-alert').classList.add('visually-hidden');

		// Remove player
		if (playerToHide && playerToHide.parentNode) {
			playerToHide.parentNode.removeChild(playerToHide);
		}
	});
	document.querySelector('.tournament-info-kick-alert .alert-confirm-button').addEventListener('keypress', function (event) {
		if (event.key === 'Enter') {
			// Hide alert
			document.querySelector('.tournament-info-kick-alert').classList.add('visually-hidden');

			// Remove player
			if (playerToHide) {
				playerToHide.parentNode.removeChild(playerToHide);
			}
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

document.querySelector('.tournament-info-edit-alert .alert-confirm-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
	setAriaHidden();

	// Update tournament name
	var	tournamentNameInput = document.querySelector('.tournament-info-name-input');
	document.querySelector('.tournament-info-name').textContent = tournamentNameInput.value;

	leaveTournamentEditMode();
});

document.querySelector('.tournament-info-edit-alert .alert-confirm-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		// Hide alert
		document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
		setAriaHidden();
	
		// Update tournament name
		var	tournamentNameInput = document.querySelector('.tournament-info-name-input');
		document.querySelector('.tournament-info-name').textContent = tournamentNameInput.value;
	
		leaveTournamentEditMode();
	}
});

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

// Invite a friend in the list

document.querySelectorAll('.tournament-info-invite .content-card').forEach(function(item) {
	item.addEventListener('click', function () {
		var invitedNick = item.querySelector('.user-card-name').textContent;
		var	invitedPic = item.querySelector('.user-card-picture img').getAttribute('src');

		// Show alert
		document.querySelector('.tournament-info-invite-alert').classList.remove('visually-hidden');
		setAriaHidden();
		document.querySelector('.tournament-info-invite-alert .alert-confirm-button').focus();

		// Confirm the invite
		document.querySelector('.tournament-info-invite-alert .alert-confirm-button').addEventListener('click', function () {
			if (invitedNick) {
				addInvitedPlayerToTournament(invitedNick, invitedPic);
				invitedNick = null;

				removeItemFromFriendsList(item);
			}
		});
		document.querySelector('.tournament-info-invite-alert .alert-confirm-button').addEventListener('keypress', function (event) {
			if (event.key === 'Enter' && invitedNick) {
				addInvitedPlayerToTournament(invitedNick, invitedPic);
				invitedNick = null;

				removeItemFromFriendsList(item);
			}
		});

		// Cancel the invite
		document.querySelector('.tournament-info-invite-alert .alert-cancel-button').addEventListener('click', function () {
			// Hide alert
			document.querySelector('.tournament-info-invite-alert').classList.add('visually-hidden');
			setAriaHidden();

			invitedNick = null;
		});
		document.querySelector('.tournament-info-invite-alert .alert-cancel-button').addEventListener('keypress', function (event) {
			if (event.key === 'Enter') {
				// Hide alert
				document.querySelector('.tournament-info-invite-alert').classList.add('visually-hidden');
				setAriaHidden();
	
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

function addInvitedPlayerToTournament(nick, pic) {
	// Hide alert
	document.querySelector('.tournament-info-invite-alert').classList.add('visually-hidden');

	var playersList = document.querySelector('.tournament-info-players');
	
	playersList.insertAdjacentHTML('beforeend', `\
    <button class="content-card invite-pending d-flex justify-content-between align-items-center purple-shadow">
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
		item.addEventListener('click', loadUserProfile(item.getAttribute('user-id')));
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

document.addEventListener('keydown', function(e) {
	let isFw =!e.shiftKey;

	if (!document.querySelector('.tournament-info').classList.contains('visually-hidden')) {
		var	firstPlayerCard = document.querySelector('.tournament-info-players button');
		var	lastPlayerCard = document.querySelector('.tournament-info-players').lastElementChild;
		var firstInviteCard = document.querySelector('.tournament-info-invite button');
		var	lastInviteCard = document.querySelector('.tournament-info-invite').lastElementChild;

		// tournament icon -> next
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-icon')) {
			if (document.querySelector('.tournament-info-name-input-container').classList.contains('visually-hidden')) {
				// if you are tournament owner
				// document.querySelector('.tournament-info-edit-icon').focus();
				// else if you joined the tournament
				// document.querySelector('.tournament-info-invite-icon').focus();
				// else
				document.querySelector('.tournament-info-join-icon').focus();
				e.preventDefault();
				return ;
			}
		}
		if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-icon')) {
			// if there is no player
			// document.querySelector('.tournament-info-join-icon').focus();
			// if you are owner
			// lastPlayerCard.querySelector('.tournament-kick-player').focus();
			// else
			lastPlayerCard.focus();
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
			// if you have joined the tournament
			// document.querySelector('.tournament-info-leave-icon').focus();
			// else
			document.querySelector('.tournament-info-join-icon').focus();
			e.preventDefault();
			return ;
		}

		// join -> previous
		if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-join-icon')) {
			// if you are owner OR you have joined tournament
			// document.querySelector('.tournament-info-invite-icon').focus();
			// else
			document.querySelector('.tournament-info-icon').focus();
			e.preventDefault();
			return ;
		}
		// leave -> previous
		if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-leave-icon')) {
			// if you are owner OR you have joined tournament
			// document.querySelector('.tournament-info-invite-icon').focus();
			// else
			document.querySelector('.tournament-info-icon').focus();
			e.preventDefault();
			return ;
		}

		// if you are the owner (invite -> edit)
		// if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-invite-icon')) {
		// 	document.querySelector('.tournament-info-edit-icon').focus();
		// 	e.preventDefault();
		// 	return ;
		// }

		// if you are the owner (edit -> tournament icon)
		// if (e.key == 'Tab' && !isFw && document.activeElement === document.querySelector('.tournament-info-edit-icon')) {
		// 	document.querySelector('.tournament-info-icon').focus();
		// 	e.preventDefault();
		// 	return ;
		// }

		// input -> check (if you are owner)
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-name-input')) {
				document.querySelector('.tournament-info-check-icon').focus();
				e.preventDefault();
				return ;
		}

		// invite -> join / leave
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-invite-icon')) {
			// if you have already joined the tournament
			// document.querySelector('.tournament-info-leave-icon').focus();
			// else
			document.querySelector('.tournament-info-join-icon').focus();
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
		// if (e.key == 'Tab' && isFw && document.activeElement === lastPlayerCard.querySelector('.tournament-kick-player')) {
		// 	document.querySelector('.tournament-info-icon').focus();
		// 	e.preventDefault();
		// 	return ;
		// }
		// else
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
});