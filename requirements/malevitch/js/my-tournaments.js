// Hide when clicking top left button

document.querySelector('.my-tournaments-icon').addEventListener('click', function() {
	document.querySelector('.my-tournaments').classList.add('visually-hidden');
	document.querySelector('.homepage-header-logo').focus();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load tournament page when clicking on a tournament

document.querySelectorAll('.my-tournaments-card-container .content-card').forEach(function(item) {
	item.addEventListener('click', function () {
		loadTournamentInfo();

		document.querySelector('.tournament-info-icon').focus();
		
		hideEveryPage();

		g_state.pageToDisplay = '.tournament-info';
		window.history.pushState(g_state, null, "");
		render(g_state);
	});
});

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.my-tournaments').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;
		var	noTournamentAtAll = document.querySelector('.my-tournaments-empty');
		var	noTournamentOngoing = document.querySelector('.my-tournaments-no-open');
		var	noTournamentClosed = document.querySelector('.my-tournaments-no-closed');
		var	lastTournamentCard;
	
		// If no tournament at all
		if (e.key === 'Tab' && !noTournamentAtAll.classList.contains('visually-hidden')) {
			document.querySelector('.my-tournaments-icon').focus();
			e.preventDefault();
		}
		// Determine last tournament card
		if (!noTournamentOngoing.classList.contains('visually-hidden')) {
			lastTournamentCard = document.querySelector('.my-tournaments-closed').lastElementChild;
		}
		else if (!noTournamentClosed.classList.contains('visually-hidden')) {
			lastTournamentCard = document.querySelector('.my-tournaments-ongoing').lastElementChild;
		}
		else {
			lastTournamentCard = document.querySelector('.my-tournaments-closed').lastElementChild;
		}
		// Loop after last friends card
		if (e.key === 'Tab' && isFw && document.activeElement === lastTournamentCard) {
			document.querySelector('.my-tournaments-icon').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.activeElement === document.querySelector('.my-tournaments-icon')) {
			lastTournamentCard.focus();
			e.preventDefault();
		}
	}
});