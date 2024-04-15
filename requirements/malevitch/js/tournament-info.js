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

	// TODO : reveal edit for tournament name
});

// Kick a player

document.querySelectorAll('.tournament-kick-player').forEach(function(item) {
	item.addEventListener('click', function(event) {
		event.stopPropagation();

		// Show alert
		document.querySelector('.tournament-info-kick-alert').classList.remove('visually-hidden');

		// Confirm the kick
		document.querySelector('.tournament-info-kick-alert .alert-confirm-button').addEventListener('click', function() {
			// Hide alert
			document.querySelector('.tournament-info-kick-alert').classList.add('visually-hidden');

			var playerToHide = item.parentNode;

			playerToHide.parentNode.removeChild(playerToHide);
		});

		// Cancel the kick
		document.querySelector('.tournament-info-kick-alert .alert-cancel-button').addEventListener('click', function() {
			// Hide alert
			document.querySelector('.tournament-info-kick-alert').classList.add('visually-hidden');
		});
	});
});

// Leave edit mode

document.querySelector('.tournament-info-check-icon').addEventListener('click', function () {
	// Show alert
	document.querySelector('.tournament-info-edit-alert').classList.remove('visually-hidden');
});

	// Confirm / cancel the leaving

document.querySelector('.tournament-info-edit-alert .alert-cancel-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');
});

document.querySelector('.tournament-info-edit-alert .alert-confirm-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.tournament-info-edit-alert').classList.add('visually-hidden');

	// Switch button appearance
	document.querySelector('.tournament-info-check-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-edit-icon').classList.remove('visually-hidden');

	// Hide kick buttons
	document.querySelectorAll('.tournament-kick-player').forEach(item => {
		item.classList.add('visually-hidden');
	});

	// TODO : hide edit for tournament name
});