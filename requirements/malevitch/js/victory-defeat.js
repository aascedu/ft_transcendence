// Go home when clicking the home button

document.querySelector('.victory-defeat-home').addEventListener('click', function() {
	document.querySelector('.victory-defeat').classList.add('visually-hidden');

	document.querySelector('.homepage-game-picture').classList.remove('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Go to tournament page when clicking the tournament button

document.querySelector('.victory-defeat-tournament').addEventListener('click', async function() {
	document.querySelector('.victory-defeat').classList.add('visually-hidden');

	document.querySelector('.homepage-game-picture').classList.remove('visually-hidden');

	clearTournamentInfo();
	await loadTournamentInfo();

	g_state.pageToDisplay = '.tournament-info';
	window.history.pushState(g_state, null, "");
	render(g_state);
});