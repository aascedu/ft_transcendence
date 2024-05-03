// Hide when clicking top left button

document.querySelector('.tournament-info-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load user profile page when clicking on a player

document.querySelectorAll('.tournament-info-players .content-card').forEach(function(item) {
	item.addEventListener('click', loadUserProfile);
});

function loadUserProfile() {
	// if player is yourself
	// document.querySelector('.user-profile-picture-input').focus();
	// else if user is your friend
	// document.querySelector('.user-profile-remove-icon').focus();
	// else
	document.querySelector('.user-profile-add-icon').focus();

	hideEveryPage();

	g_state.pageToDisplay = '.user-profile';
	window.history.pushState(g_state, null, "");
	render(g_state);
}

// Ask for confirmation when joining tournament

document.querySelector('.tournament-info-join-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info-join-alert').classList.remove('visually-hidden');
	document.querySelector('.tournament-info-join-alert .alert-confirm-button').focus();
});

	// Confirm / cancel the invitation

document.querySelector('.tournament-info-join-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-join-alert').classList.add('visually-hidden');

	document.querySelector('.tournament-info-join-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-leave-icon').classList.remove('visually-hidden');
	document.querySelector('.tournament-info-leave-icon').focus();
});
document.querySelector('.tournament-info-join-alert .alert-confirm-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.tournament-info-join-alert').classList.add('visually-hidden');
	
		document.querySelector('.tournament-info-join-icon').classList.add('visually-hidden');
		document.querySelector('.tournament-info-leave-icon').classList.remove('visually-hidden');
		document.querySelector('.tournament-info-leave-icon').focus();
	}
});

document.querySelector('.tournament-info-join-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-join-alert').classList.add('visually-hidden');
});
document.querySelector('.tournament-info-join-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.tournament-info-join-alert').classList.add('visually-hidden');
	}
});

// Ask for confirmation when leaving tournament

document.querySelector('.tournament-info-leave-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info-leave-alert').classList.remove('visually-hidden');
	document.querySelector('.tournament-info-leave-alert .alert-confirm-button').focus();
});

	// Confirm / cancel the leaving

document.querySelector('.tournament-info-leave-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');

	document.querySelector('.tournament-info-leave-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-join-icon').classList.remove('visually-hidden');
	document.querySelector('.tournament-info-join-icon').focus();
});
document.querySelector('.tournament-info-leave-alert .alert-confirm-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');
	
		document.querySelector('.tournament-info-leave-icon').classList.add('visually-hidden');
		document.querySelector('.tournament-info-join-icon').classList.remove('visually-hidden');
		document.querySelector('.tournament-info-join-icon').focus();
	}
});

document.querySelector('.tournament-info-leave-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');
});
document.querySelector('.tournament-info-leave-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');
	}
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

	// Update tournament name
	var	tournamentNameInput = document.querySelector('.tournament-info-name-input');
	document.querySelector('.tournament-info-name').textContent = tournamentNameInput.value;

	leaveTournamentEditMode();
});

document.querySelector('.tournament-info-edit-alert .alert-confirm-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		// Hide alert
		document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
	
		// Update tournament name
		var	tournamentNameInput = document.querySelector('.tournament-info-name-input');
		document.querySelector('.tournament-info-name').textContent = tournamentNameInput.value;
	
		leaveTournamentEditMode();
	}
});

document.querySelector('.tournament-info-edit-alert .alert-cancel-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
});

document.querySelector('.tournament-info-edit-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		// Hide alert
		document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
	}
});

// Open list of friends to invite

document.querySelector('.tournament-info-invite-icon').addEventListener('click', function () {
	document.querySelector('.tournament-info-invite-box').classList.toggle('visually-hidden');

	if (document.querySelector('.tournament-info-no-friends').classList.contains('visually-hidden')) {
		document.querySelector('.tournament-info-invite button').focus();
	}
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
	}
});

// Invite a friend in the list

document.querySelectorAll('.tournament-info-invite .content-card').forEach(function(item) {
	item.addEventListener('click', function () {
		var invitedNick = item.querySelector('.user-card-name').textContent;
		var	invitedPic = item.querySelector('.user-card-picture img').getAttribute('src');

		// Show alert
		document.querySelector('.tournament-info-invite-alert').classList.remove('visually-hidden');
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

			invitedNick = null;
		});
		document.querySelector('.tournament-info-invite-alert .alert-cancel-button').addEventListener('keypress', function (event) {
			if (event.key === 'Enter') {
				// Hide alert
				document.querySelector('.tournament-info-invite-alert').classList.add('visually-hidden');
	
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
    <div class="content-card invite-pending d-flex justify-content-between align-items-center purple-shadow">
        <div class="d-flex flex-nowrap align-items-center">
            <div class="user-card-name unselectable">`+ nick + `</div>
            <div class="user-card-pending" data-language="pending">(pending...)</div>
        </div>
        <div class="user-card-picture">
            <img src="` + pic + `" alt="profile picture of friend" draggable="false" (dragstart)="false;" class="unselectable">
        </div>
        <div class="tournament-kick-player d-flex justify-content-center align-items-center position-absolute visually-hidden">
            <img src="assets/general/remove-black.svg" alt="kick player" draggable="false" (dragstart)="false;" class="unselectable">
        </div>
    </div>`);

	document.querySelectorAll('.tournament-info-players .content-card').forEach(function(item) {
		item.addEventListener('click', loadUserProfile);
	});

	if (!document.querySelector('.tournament-info-no-players').classList.contains('visually-hidden')) {
		document.querySelector('.tournament-info-no-players').classList.add('visually-hidden');
	}
}

function removeItemFromFriendsList(item) {
	if (item.parentNode.children.length == 2) {
		document.querySelector('.tournament-info-no-friends').classList.remove('visually-hidden');
		document.querySelector('.tournament-info-invite-box').style.minHeight = "40vh";
		document.querySelector('.tournament-info-invite').style.minHeight = "40vh";
		document.querySelector('.tournament-info-invite-box').classList.add('visually-hidden');
	}
	item.parentNode.removeChild(item);
}

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.tournament-info').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;
		var	firstPlayerCard = document.querySelector('.tournament-info-players button');
		var	lastPlayerCard = document.querySelector('.tournament-info-players').lastElementChild;
		var firstInviteCard = document.querySelector('.tournament-info-invite button');
		var	lastInviteCard = document.querySelector('.tournament-info-invite').lastElementChild;

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
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-join-icon')) {
			if (firstPlayerCard) {
				firstPlayerCard.focus();
				e.preventDefault();
				return ;
			}
		}
		// edit (if you are owner)
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-name-input')) {
				document.querySelector('.tournament-info-check-icon').focus();
				e.preventDefault();
				return ;
		}
		// invite friends
		if (e.key == 'Tab' && isFw && document.activeElement === document.querySelector('.tournament-info-invite-icon')) {
			// if you have already joined the tournament
			// document.querySelector('.tournament-info-leave-icon').focus();
			// else
			document.querySelector('.tournament-info-join-icon').focus();
			e.preventDefault();
			return ;
		}
		if (e.key == 'Tab' && isFw && document.activeElement === lastInviteCard) {
			if (document.querySelector('.tournament-info-no-friends').classList.contains('visually-hidden')) {
				firstInviteCard.focus();
				e.preventDefault();
				return ;
			}
		}
		if (document.querySelector('.tournament-info-no-friends').classList.contains('visually-hidden')) {
			if (e.key == 'Tab' && !isFw && document.activeElement === firstInviteCard) {
				lastInviteCard.focus();
				e.preventDefault();
				return ;
			}
		}
		if (e.key == 'Escape' && document.activeElement.parentElement.classList.contains('tournament-info-invite')) {
			document.querySelector('.tournament-info-invite').classList.add('visually-hidden');
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
});