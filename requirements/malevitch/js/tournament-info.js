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

	// Confirm / cancel the remove

document.querySelector('.tournament-info-leave-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');

	document.querySelector('.tournament-info-leave-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-join-icon').classList.remove('visually-hidden');
});

document.querySelector('.tournament-info-leave-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.tournament-info-leave-alert').classList.add('visually-hidden');
});
