// Hide when clicking top left button

document.querySelector('.available-tournaments-icon').addEventListener('click', function() {
	document.querySelector('.available-tournaments').classList.add('visually-hidden');
	document.querySelector('.homepage-header-logo').focus();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load tournament page when clicking on a tournament

document.querySelectorAll('.available-tournaments-card-container .content-card').forEach(function(item) {
	item.addEventListener('click', function () {
		document.querySelector('.tournament-info-icon').focus();

		hideEveryPage();

		g_state.pageToDisplay = '.tournament-info';
		window.history.pushState(g_state, null, "");
		render(g_state);
	});
});

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.available-tournaments').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;
		var	noTournamentAtAll = document.querySelector('.available-tournaments-empty');
		var	lastTournamentCard = document.querySelector('.available-tournaments-card-container').lastElementChild.lastElementChild;
	
		// If no tournament at all
		if (e.key === 'Tab' && !noTournamentAtAll.classList.contains('visually-hidden')) {
			document.querySelector('.available-tournaments-icon').focus();
			e.preventDefault();
		}
		// Loop after last tournament card
		if (e.key === 'Tab' && isFw && document.activeElement === lastTournamentCard) {
			document.querySelector('.available-tournaments-icon').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.activeElement === document.querySelector('.available-tournaments-icon')) {
			lastTournamentCard.focus();
			e.preventDefault();
		}
	}
});