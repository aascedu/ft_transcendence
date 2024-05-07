document.querySelector('.homepage-game-content-friends-icon').addEventListener('click', function() {
    fetch('/alfred/user/users/' + g_userId, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + g_jwt,
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error fetching friend list');
        }
    })
    .then(data => {
        var friendsListContainer = document.querySelector('.homepage-friend-content-card-container');
        friendsListContainer.innerHTML = '';

        data.Friends.forEach(friend => {
            var friendCard = document.createElement('button');
            friendCard.classList.add('content-card', 'w-100', 'd-flex', 'justify-content-between', 'align-items-center', 'purple-shadow');
        
            var friendName = document.createElement('div');
            friendName.classList.add('user-card-name', 'unselectable');
            friendName.textContent = friend.Nick;
            var friendPicture = document.createElement('div');
            friendPicture.classList.add('user-card-picture');
            var friendPictureImg = document.createElement('img');
            friendPictureImg.src = friend.Pic;
            friendPictureImg.alt = 'profile picture of friend';
            friendPictureImg.draggable = false;
            friendPictureImg.classList.add('unselectable');
            friendPicture.appendChild(friendPictureImg);
            friendCard.appendChild(friendName);
            friendCard.appendChild(friendPicture);
            friendsListContainer.appendChild(friendCard);
        });
        hideEveryPage();
        g_state.pageToDisplay = '.friends-list';
        window.history.pushState(g_state, null, "");
        render(g_state);
    })
    .catch(error => {
        console.error('Error fetching friend list:', error);
    });
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
	document.querySelector('.my-tournaments-icon').focus();
	
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
		document.querySelector('.user-profile-remove-icon').focus();

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