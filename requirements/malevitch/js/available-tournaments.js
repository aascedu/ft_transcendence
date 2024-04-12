// Hide when clicking top left button

document.querySelector('.available-tournaments-icon').addEventListener('click', function() {
	document.querySelector('.available-tournaments').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load tournament page when clicking on a tournament

document.querySelectorAll('.available-tournaments-card-container .content-card').forEach(function(item) {
	item.addEventListener('click', function () {
		hideEveryPage();

		g_state.pageToDisplay = '.tournament-info';
		window.history.pushState(g_state, null, "");
		render(g_state);
	});
});