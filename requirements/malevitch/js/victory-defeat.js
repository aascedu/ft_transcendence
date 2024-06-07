// Go home when clicking the home button

document.querySelector('.victory-defeat-home').addEventListener('click', async function() {
	document.querySelector('.victory-defeat').classList.add('visually-hidden');

	document.querySelector('.homepage-game-picture').classList.remove('visually-hidden');

	await clearHomepageContent();
	await setHomepageContent();

	clearHomepageHeader();
	await loadHomepageHeader();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Go to tournament page when clicking the tournament button

document.querySelector('.victory-defeat-tournament').addEventListener('click', async function() {
	document.querySelector('.victory-defeat').classList.add('visually-hidden');

	document.querySelector('.homepage-game-picture').classList.remove('visually-hidden');

	await loadOngoingTournament();

	g_state.pageToDisplay = '.tournament-info';
	window.history.pushState(g_state, null, "");
	render(g_state);
});