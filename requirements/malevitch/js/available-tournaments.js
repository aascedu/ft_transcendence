document.querySelector('.available-tournaments-icon').addEventListener('click', function() {
	document.querySelector('.available-tournaments').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});