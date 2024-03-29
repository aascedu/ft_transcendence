document.querySelector('.homepage-game-content-friends-icon').addEventListener('click', function() {
	hideEveryPage();

	g_state.pageToDisplay = '.friends-list';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

document.querySelector('.homepage-game-content-tournaments').addEventListener('click', function() {
	hideEveryPage();

	g_state.pageToDisplay = '.my-tournaments';
	window.history.pushState(g_state, null, "");
	render(g_state);
});