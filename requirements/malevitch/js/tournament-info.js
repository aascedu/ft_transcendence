// Hide when clicking top left button

document.querySelector('.tournament-info-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load user profile page when clicking on a player

document.querySelectorAll('.tournament-info-players .content-card').forEach(function(item) {
	item.addEventListener('click', function () {
		hideEveryPage();

		g_state.pageToDisplay = '.user-profile';
		window.history.pushState(g_state, null, "");
		render(g_state);
	});
});

// Ask for confirmation when joining tournament

document.querySelector('.tournament-info-join-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info-join-alert').classList.remove('visually-hidden');
});

	// Confirm / cancel the invitation

document.querySelector('.tournament-info-join-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-join-alert').classList.add('visually-hidden');

	document.querySelector('.tournament-info-join-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-leave-icon').classList.remove('visually-hidden');
});

document.querySelector('.tournament-info-join-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-join-alert').classList.add('visually-hidden');
});

// Ask for confirmation when leaving tournament

document.querySelector('.tournament-info-leave-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info-leave-alert').classList.remove('visually-hidden');
});

	// Confirm / cancel the leaving

document.querySelector('.tournament-info-leave-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');

	document.querySelector('.tournament-info-leave-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-join-icon').classList.remove('visually-hidden');
});

document.querySelector('.tournament-info-leave-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');
});

// Enter edit mode

document.querySelector('.tournament-info-edit-icon').addEventListener('click', function () {
	// Switch button appearance
	document.querySelector('.tournament-info-edit-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-check-icon').classList.remove('visually-hidden');

	// Reveal kick buttons
	document.querySelectorAll('.tournament-kick-player').forEach(item => {
		item.classList.remove('visually-hidden');
	});

	// Hide tournament name
	document.querySelector('.tournament-info-name').classList.add('visually-hidden');

	// Reveal edit tournament name with tournament name as default value
	var	tournamentName = document.querySelector('.tournament-info-name').textContent;
	var tournamentNameInput = document.querySelector('.tournament-info-name-input');

	tournamentNameInput.value = tournamentName;
	document.querySelector('.tournament-info-name-input-container').classList.remove('visually-hidden');
});

// Kick a player

document.querySelectorAll('.tournament-kick-player').forEach(function(item) {
	item.addEventListener('click', function(event) {
		event.stopPropagation();

		var playerToHide = item.parentNode;

		// Show alert
		document.querySelector('.tournament-info-kick-alert').classList.remove('visually-hidden');

		// Confirm the kick
		document.querySelector('.tournament-info-kick-alert .alert-confirm-button').addEventListener('click', function () {
			// Hide alert
			document.querySelector('.tournament-info-kick-alert').classList.add('visually-hidden');

			// Remove player
			if (playerToHide) {
				playerToHide.parentNode.removeChild(playerToHide);
			}
		});

		// Cancel the kick
		document.querySelector('.tournament-info-kick-alert .alert-cancel-button').addEventListener('click', function () {
			// Hide alert
			document.querySelector('.tournament-info-kick-alert').classList.add('visually-hidden');

			playerToHide = null;
		});

		// Click outside the alert to cancel
		document.querySelector('.tournament-info-kick-alert').addEventListener('click', function (event) {
			if (this !== event.target) {
				return ;
			}
			playerToHide = null;
		});
	});
});

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

document.querySelector('.tournament-info-edit-alert .alert-cancel-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
});