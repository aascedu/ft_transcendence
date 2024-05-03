// Back to homepage

document.querySelector('.homepage-header-logo').addEventListener('click', function() {
	document.querySelector('.homepage-game-picture').classList.remove('visually-hidden');

	var	currentPage = g_state.pageToDisplay;

	g_state.pageToDisplay = '.homepage-game';

	if (currentPage != '.homepage-game') {
		document.querySelector(currentPage).classList.add('visually-hidden');
		window.history.pushState(g_state, null, "");
	}
	render(g_state);
});

// Display header menus

document.querySelector('.homepage-header-tournaments').addEventListener('click', function() {
	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		if (!item.classList.contains('homepage-header-open-tournaments')) {
			item.classList.add('visually-hidden');
		}
	});
	document.querySelector('.homepage-header-open-tournaments').classList.toggle('visually-hidden');
	if (!document.querySelector('.homepage-header-open-tournaments').classList.contains('visually-hidden')) {
		document.querySelector('.homepage-header-available-tournaments').focus();
	}
});

document.querySelector('.homepage-header-play').addEventListener('click', function() {
	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		if (!item.classList.contains('homepage-header-open-play')) {
			item.classList.add('visually-hidden');
		}
	});
	document.querySelector('.homepage-header-open-play').classList.toggle('visually-hidden');
	if (!document.querySelector('.homepage-header-open-play').classList.contains('visually-hidden')) {
		document.querySelector('.homepage-header-quick-play').focus();
	}
});

document.querySelector('.homepage-header-friends').addEventListener('click', function() {
	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		if (!item.classList.contains('homepage-header-open-friends')) {
			item.classList.add('visually-hidden');
		}
	});
	document.querySelector('.homepage-header-open-friends').classList.toggle('visually-hidden');
	if (!document.querySelector('.homepage-header-open-friends').classList.contains('visually-hidden')) {
		document.querySelector('.homepage-header-friend-list').focus();
	}
});

// Close menus on click outside

function isHeaderOpenMenu(target) {
	var	temp = target;
	if (target.classList && target.classList.contains('homepage-header-open-menu')) {
		return true;
	}
	while(target.parentNode && target.parentNode.nodeName.toLowerCase() != 'body') {
		var	parentClassList = target.parentNode.classList;
		if (parentClassList && parentClassList.contains('homepage-header-open-menu')) {
			return true;
		}
		target = target.parentNode;
	}
	target = temp;
	if (target.classList && target.classList.contains('homepage-header-menu-button')) {
		return true;
	}
	while(target.parentNode && target.parentNode.nodeName.toLowerCase() != 'body') {
		var	parentClassList = target.parentNode.classList;
		if (parentClassList && parentClassList.contains('homepage-header-menu-button')) {
			return true;
		}
		target = target.parentNode;
	}
	return false;
}

window.addEventListener('click', function ({target}){
	if (!isHeaderOpenMenu(target)) {
		document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
			if (!item.classList.contains('visually-hidden')) {
				item.classList.add('visually-hidden');
			}
		});
	}
	if (document.querySelector('.homepage-header-open-play').classList.contains('visually-hidden')) {
		// play menu : close "play with a friend" panel
		document.querySelector('.homepage-header-play-friend').classList.remove('homepage-header-category-clicked');
		document.querySelectorAll('.homepage-header-play-friend-card').forEach(function(item) {
			item.classList.add('visually-hidden');
		});
		document.querySelector('.homepage-header-no-friends').classList.add('visually-hidden');
	}
	if (document.querySelector('.homepage-header-open-friends').classList.contains('visually-hidden')) {
		// friends menu : close "add a friend" input
		document.querySelector('.homepage-header-add-friend').classList.remove('homepage-header-category-clicked');
		document.querySelector('.homepage-header-add-friend-input-box').classList.add('visually-hidden');
		document.querySelector('.homepage-header-add-friend-input-warning').classList.add('visually-hidden');
		document.querySelector('.homepage-header-add-friend-submit').classList.add('visually-hidden');
		document.querySelector('.homepage-header-add-friend-input').value = '';
	}
});

// --- TOURNAMENTS ---

// Go to available tournaments

document.querySelector('.homepage-header-available-tournaments').addEventListener('click', function() {
	hideEveryPage();

	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		item.classList.add('visually-hidden');
	});

	document.querySelector('.available-tournaments-icon').focus();

	g_state.pageToDisplay = '.available-tournaments';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Go to my tournaments

document.querySelector('.homepage-header-my-tournaments').addEventListener('click', function() {
	hideEveryPage();

	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		item.classList.add('visually-hidden');
	});

	document.querySelector('.my-tournaments-icon').focus();

	g_state.pageToDisplay = '.my-tournaments';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Go to new tournament

document.querySelector('.homepage-header-new-tournament').addEventListener('click', function() {
	hideEveryPage();

	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		item.classList.add('visually-hidden');
	});

	g_state.pageToDisplay = '.create-tournament';
	window.history.pushState(g_state, null, "");
	render(g_state);

	document.querySelector('.create-tournament-name-input').focus();
});

// --- PLAY ---

// Quick play

document.querySelector('.homepage-header-quick-play').addEventListener('click', function() {
	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		item.classList.add('visually-hidden');
	});

	if (document.querySelector('.notif-search-match').classList.contains('visually-hidden')) {
		searchMatch();
	}
});

// Play with friend

document.querySelector('.homepage-header-play-friend').addEventListener('click', function() {
	this.classList.toggle('homepage-header-category-clicked');

	// si des amis sont en ligne
	document.querySelectorAll('.homepage-header-play-friend-card').forEach(function(item) {
		item.classList.toggle('visually-hidden');
	});

	// sinon
	document.querySelector('.homepage-header-no-friends').classList.toggle('visually-hidden');
});

document.querySelectorAll('.homepage-header-play-friend-card').forEach(function(item) {
	item.addEventListener('click', function() {
		// close header menu and toggle back invites
		document.querySelector('.homepage-header-open-play').classList.add('visually-hidden');
		document.querySelector('.homepage-header-play-friend').classList.toggle('homepage-header-category-clicked');
		document.querySelectorAll('.homepage-header-play-friend-card').forEach(function(item) {
			item.classList.add('visually-hidden');
		});
		document.querySelector('.homepage-header-no-friends').classList.add('visually-hidden');

		// send invite

		// remove invited friend from list
		item.parentNode.removeChild(item);

		// show notif 3 seconds to confirm invite
		inviteSentNotif(item.querySelector('p').textContent);
	});
});

// --- FRIENDS ---

// Go to friends list

document.querySelector('.homepage-header-friend-list').addEventListener('click', function() {
	hideEveryPage();

	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		item.classList.add('visually-hidden');
	});

	document.querySelector('.friends-list-icon').focus();

	g_state.pageToDisplay = '.friends-list';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Add friend

document.querySelector('.homepage-header-add-friend').addEventListener('click', function() {
	this.classList.toggle('homepage-header-category-clicked');

	document.querySelector('.homepage-header-add-friend-input-box').classList.toggle('visually-hidden');
});

document.querySelector('.homepage-header-add-friend-input').addEventListener('input', function() {
	if (this.value.length > 0) {
		document.querySelector('.homepage-header-add-friend-submit').classList.remove('visually-hidden');
		document.querySelector('.homepage-header-add-friend-input-warning').classList.add('visually-hidden');
	}
	else {
		document.querySelector('.homepage-header-add-friend-submit').classList.add('visually-hidden');
	}
});

document.querySelector('.homepage-header-add-friend-input').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		addFriend();
	}
});

document.querySelector('.homepage-header-add-friend-submit').addEventListener('click', function() {
	addFriend();
});

document.querySelector('.homepage-header-add-friend-submit').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		addFriend();
	}
});

function addFriend() {
	var	nickname = document.querySelector('.homepage-header-add-friend-input').value;
	
	// check if user is yourself
	if (nickname == g_userNick) {
		return ;
	}

	// check if user exists in the db
	fetch('/petrus/auth/signin/' + nickname)
		.then (response => {
			if (!response.ok) {
				throw new Error('HTTP error: ' + response.status);
			}
			return response.json();
		})
		.then (data => {
			if (data.Ava) {
				// input warning
				document.querySelector('.homepage-header-add-friend-input-warning').classList.remove('visually-hidden');
				document.querySelector('.homepage-header-add-friend-input').value = '';
			}
			else {
				// send invite

				// show notif to tell invite has been sent
				inviteSentNotif(document.querySelector('.homepage-header-add-friend-input').value);

				// close menu
				document.querySelector('.homepage-header-add-friend').classList.remove('homepage-header-category-clicked');
				document.querySelector('.homepage-header-add-friend-input-box').classList.add('visually-hidden');
				document.querySelector('.homepage-header-add-friend-input-warning').classList.add('visually-hidden');
				document.querySelector('.homepage-header-add-friend-submit').classList.add('visually-hidden');
				document.querySelector('.homepage-header-add-friend-input').value = '';
				document.querySelector('.homepage-header-open-friends').classList.add('visually-hidden');
			}
			
		})
		.catch (error => {
			console.error('Fetch problem:', error.message);
		});
}

// --- OTHER ---

// Go to profile

document.querySelector('.homepage-header-profile').addEventListener('click', function() {
	hideEveryPage();

	g_state.pageToDisplay = '.user-profile';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Go to accessibility

document.querySelector('.homepage-header-accessibility').addEventListener('click', function() {
	hideEveryPage();

	g_state.pageToDisplay = '.accessibility';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.homepage-header').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;
		
		// navigate through header
		if (e.key === 'Tab' && isFw && document.querySelector('.homepage-header-profile') === document.activeElement) {
			// pages
			if (!document.querySelector('.homepage-game').classList.contains('visually-hidden')) {
				document.querySelector('.homepage-game-content-play').focus();
			}
			if (!document.querySelector('.friends-list').classList.contains('visually-hidden')) {
				document.querySelector('.friends-list-icon').focus();
			}
			if (!document.querySelector('.my-tournaments').classList.contains('visually-hidden')) {
				document.querySelector('.my-tournaments-icon').focus();
			}
			if (!document.querySelector('.available-tournaments').classList.contains('visually-hidden')) {
				document.querySelector('.available-tournaments-icon').focus();
			}
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.querySelector('.homepage-header-logo') === document.activeElement) {
			if (!document.querySelector('.homepage-game').classList.contains('visually-hidden')) {
				var	noFriends = document.querySelector('.homepage-game-content-no-friends');
			
				if (!noFriends.classList.contains('visually-hidden')) {
					document.querySelector('.homepage-game-content-friends-icon').focus();
				}
				else {
					var lastFriendCard = document.querySelector('.homepage-friend-content-card-container').lastElementChild;
					lastFriendCard.focus();
				}
			}
			e.preventDefault();
		}

		// navigate through open menus
		// tournaments menu
		if (e.key === 'Tab' && isFw && document.querySelector('.homepage-header-new-tournament') === document.activeElement) {
			document.querySelector('.homepage-header-available-tournaments').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.querySelector('.homepage-header-available-tournaments') === document.activeElement) {
			document.querySelector('.homepage-header-new-tournament').focus();
			e.preventDefault();
		}
		// play menu
		if (e.key === 'Tab' && isFw && document.querySelector('.homepage-header-play-friend') === document.activeElement) {
			document.querySelector('.homepage-header-quick-play').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.querySelector('.homepage-header-quick-play') === document.activeElement) {
			document.querySelector('.homepage-header-play-friend').focus();
			e.preventDefault();
		}
		// friends menu
		if (e.key === 'Tab' && isFw && document.querySelector('.homepage-header-add-friend') === document.activeElement) {
			document.querySelector('.homepage-header-friend-list').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.querySelector('.homepage-header-friend-list') === document.activeElement) {
			document.querySelector('.homepage-header-add-friend').focus();
			e.preventDefault();
		}

		// leave menus
		if (e.key === 'Escape' && document.activeElement.classList.contains('homepage-header-category')) {
			var	activeParent = document.activeElement.parentElement;

			activeParent.classList.add('visually-hidden');

			if (activeParent.classList.contains('homepage-header-open-tournaments')) {
				document.querySelector('.homepage-header-tournaments').focus();
			}
			if (activeParent.classList.contains('homepage-header-open-play')) {
				document.querySelector('.homepage-header-play').focus();
			}
			if (activeParent.classList.contains('homepage-header-open-friends')) {
				document.querySelector('.homepage-header-friends').focus();
			}
			e.preventDefault();
		}
	}
});
