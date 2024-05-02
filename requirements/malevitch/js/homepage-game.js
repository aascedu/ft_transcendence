document.querySelector('.homepage-game-content-friends-icon').addEventListener('click', function() {
	hideEveryPage();

	g_state.pageToDisplay = '.friends-list';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

document.querySelector('.homepage-game-content-play').addEventListener('click', function() {
	// if (document.querySelector('.notif-search-match').classList.contains('visually-hidden')) {
	// 	searchMatch();
	// }

	// A CHANGER

	var	homepageHeader = document.querySelector('.homepage-header');
	homepageHeader.classList.add('visually-hidden');
	
	var	homepagePicture = document.querySelector('.homepage-game-picture');
	homepagePicture.classList.add('visually-hidden');

	hideEveryPage();

	g_state.pageToDisplay = '.game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

document.querySelector('.homepage-game-content-tournaments').addEventListener('click', function() {
	hideEveryPage();

	g_state.pageToDisplay = '.my-tournaments';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

document.querySelector('.homepage-game-content-new-tournament').addEventListener('click', function() {
	hideEveryPage();

	g_state.pageToDisplay = '.create-tournament';
	window.history.pushState(g_state, null, "");
	render(g_state);
	document.querySelector('.create-tournament-name-input').focus();
});

// Load user profile page when clicking on a friend

document.querySelectorAll('.homepage-game-content-friends .content-card').forEach(function(item) {
	item.addEventListener('click', function () {
		hideEveryPage();

		g_state.pageToDisplay = '.user-profile';
		window.history.pushState(g_state, null, "");
		render(g_state);
	});
});