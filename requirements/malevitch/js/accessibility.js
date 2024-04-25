// Hide when clicking top left button

document.querySelector('.accessibility-icon').addEventListener('click', function() {
	document.querySelector('.accessibility').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});