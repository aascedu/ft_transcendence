// Hide when clicking top left button

document.querySelector('.friends-list-icon').addEventListener('click', function() {
	document.querySelector('.friends-list').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load profile when clicking on a friend

document.querySelectorAll('.friends-list-card-container .content-card').forEach(function(item) {
	item.addEventListener('click', function () {
		hideEveryPage();

		g_state.pageToDisplay = '.user-profile';
		window.history.pushState(g_state, null, "");
		render(g_state);
	});
});