document.querySelector('.tournament-info-icon').addEventListener('click', function() {
	document.querySelector('.tournament-info').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});