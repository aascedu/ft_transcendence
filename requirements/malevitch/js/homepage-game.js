document.querySelector('.homepage-game-content-friends-icon').addEventListener('click', async function(e) {
	document.querySelector('.homepage-game-content-friends-icon').disabled = true;

	clearFriendsList();
	await loadFriendsList();

	setTimeout(() => {
		document.querySelector('.homepage-game-content-friends-icon').disabled = false;
	}, 2000);

	document.querySelector('.friends-list-icon').focus();

	hideEveryPage();

	g_state.pageToDisplay = '.friends-list';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

document.querySelector('.homepage-game-content-play').addEventListener('click', function() {
	var	matchFound = document.querySelector('.notif-match-found');
	if (g_state.pageToDisplay == '.game' || !matchFound.classList.contains('visually-hidden')) {
		return ;
	}
	if (document.querySelector('.notif-search-match').classList.contains('visually-hidden')) {
		searchMatch();
	}

	init_matchmaking_socket(0, 0);
});

document.querySelector('.homepage-game-content-tournaments').addEventListener('click', async function() {
	document.querySelector('.homepage-game-content-tournaments').disabled = true;

	clearMyTournaments();
	await loadMyTournaments();

	setTimeout(() => {
		document.querySelector('.homepage-game-content-tournaments').disabled = false;
	}, 2000);

	document.querySelector('.my-tournaments-icon').focus();

	hideEveryPage();

	g_state.pageToDisplay = '.my-tournaments';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

document.querySelector('.homepage-game-content-new-tournament').addEventListener('click', async function() {
	document.querySelector('.homepage-game-content-new-tournament').disabled = true;

	hideEveryPage();

	await loadCreateTournament();

	setTimeout(() => {
		document.querySelector('.homepage-game-content-new-tournament').disabled = false;
	}, 2000);

	g_state.pageToDisplay = '.create-tournament';
	window.history.pushState(g_state, null, "");
	render(g_state);
	document.querySelector('.create-tournament-name-input').focus();
});

// Load user profile page when clicking on a friend

document.querySelectorAll('.homepage-game-content-friends .content-card').forEach(function(item) {
	item.addEventListener('click', async function () {
		document.querySelector('.user-profile-remove-icon').focus();

		item.disabled = true;

		clearUserContent();
		await loadUserContent(item.getAttribute('user-id'));

		setTimeout(() => {
			item.disabled = false;
		}, 2000);

		hideEveryPage();

		g_state.pageToDisplay = '.user-profile';
		window.history.pushState(g_state, null, "");
		render(g_state);
	});
});

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.homepage-game').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;
		var	noFriends = document.querySelector('.homepage-game-content-no-friends');

		// If no friends are online, switch focus to header logo after friends icon
		if (e.key === 'Tab' && document.querySelector('.homepage-game-content-friends-icon') === document.activeElement) {
			if (isFw && !noFriends.classList.contains('visually-hidden')) {
				document.querySelector('.homepage-header-logo').focus();
				e.preventDefault();
			}
		}
		// Else if friends are online, navigate through friends card then switch focus to header logo
		if (e.key === 'Tab' && noFriends.classList.contains('visually-hidden')) {
			var lastFriendCard = document.querySelector('.homepage-friend-content-card-container').lastElementChild;
			if (isFw && lastFriendCard === document.activeElement) {
				document.querySelector('.homepage-header-logo').focus();
				e.preventDefault();
			}
		}

		if (e.key === 'Tab' && !isFw && document.querySelector('.homepage-game-content-play') === document.activeElement) {
			document.querySelector('.homepage-header-profile').focus();
			e.preventDefault();
		}
	}
});
