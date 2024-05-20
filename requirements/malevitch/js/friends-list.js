// Load friends list from backend

async function loadFriendsList() {
	// show friends
	var	friendsList = await get_friend(g_userId);
	friendsList = friendsList.Friends;

	if (friendsList.length == 0) {
		document.querySelector('.friends-list-card-container').classList.add('visually-hidden');
		document.querySelector('.friends-list-no-friends').classList.remove('visually-hidden');
		return ;
	}

	var	friendsOnline = await get_friend_list_online(g_userId);
	friendsOnline = friendsOnline["online-status"];

	var	friendsOnlineContainer = document.querySelector('.friends-list-online');
	var	friendsOfflineContainer = document.querySelector('.friends-list-offline');
	var	numOfFriendsOnline = 0;
	var	numOfFriendsOffline;
	var	friendId;
	var	friendNick;
	var	friendPic;
	
	for (i = 0; i < friendsList.length; i++) {
		// get friend info
		friendId = friendsList[i].Id;
		friendNick = friendsList[i].Nick;
		friendPic = friendsList[i].Pic;
		if (friendPic == null) {
			friendPic = '/assets/general/pong.png';
		}

		if (friendsOnline[friendsList[i].Id] == true) {
			friendsOnlineContainer.insertAdjacentHTML('beforeend', `\
			<button class="content-card d-flex justify-content-between align-items-center purple-shadow" user-id="` + friendId + `">
			<div class="user-card-name unselectable">` + friendNick + `</div>
			<div class="user-card-picture">
			<img src="` + friendPic + `" alt="profile picture of ` + friendNick + `" draggable="false" (dragstart)="false;" class="unselectable">
			</div>
			</button>`);

			numOfFriendsOnline++;
		}
		else {
			friendsOfflineContainer.insertAdjacentHTML('beforeend', `\
			<button class="content-card d-flex justify-content-between align-items-center purple-shadow" user-id="` + friendId + `">
			<div class="user-card-name unselectable">` + friendNick + `</div>
			<div class="user-card-picture">
			<img src="` + friendPic + `" alt="profile picture of ` + friendNick + `" draggable="false" (dragstart)="false;" class="unselectable">
			</div>
			</button>`);
		}
	}
	
	numOfFriendsOffline = friendsList.length - numOfFriendsOnline;
	if (numOfFriendsOnline == 0) {
		document.querySelector('.friends-list-no-online').classList.remove('visually-hidden');
	}
	if (numOfFriendsOffline == 0) {
		document.querySelector('.friends-list-no-offline').classList.remove('visually-hidden');
	}
}

function clearFriendsList() {
	document.querySelector('.friends-list-card-container').classList.remove('visually-hidden');
	document.querySelector('.friends-list-no-friends').classList.add('visually-hidden');
	document.querySelector('.friends-list-no-online').classList.add('visually-hidden');
	document.querySelector('.friends-list-no-online').classList.add('visually-hidden');

	var	friendsOnlineContainer = document.querySelector('.friends-list-online');
	var	friendsOfflineContainer = document.querySelector('.friends-list-offline');

	friendsOnlineContainer.querySelectorAll('.content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});

	friendsOfflineContainer.querySelectorAll('.content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});
}

// Hide when clicking top left button

document.querySelector('.friends-list-icon').addEventListener('click', function() {
	document.querySelector('.friends-list').classList.add('visually-hidden');
	document.querySelector('.homepage-header-logo').focus();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load profile when clicking on a friend

document.querySelectorAll('.friends-list-card-container .content-card').forEach(function(item) {
	item.addEventListener('click', function () {
		clearUserContent();
		loadUserContent(item.setAttribute('user-id'));

		hideEveryPage();

		g_state.pageToDisplay = '.user-profile';
		window.history.pushState(g_state, null, "");
		render(g_state);
	});
});

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.friends-list').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;
		var	noFriendsAtAll = document.querySelector('.friends-list-no-friends');
		var	noFriendsOnline = document.querySelector('.friends-list-no-online');
		var	noFriendsOffline = document.querySelector('.friends-list-no-offline');
		var	lastFriendCard;
	
		// If no friends at all
		if (e.key === 'Tab' && !noFriendsAtAll.classList.contains('visually-hidden')) {
			document.querySelector('.friends-list-icon').focus();
			e.preventDefault();
		}
		// Determine last friends card
		if (!noFriendsOnline.classList.contains('visually-hidden')) {
			lastFriendCard = document.querySelector('.friends-list-offline').lastElementChild;
		}
		else if (!noFriendsOffline.classList.contains('visually-hidden')) {
			lastFriendCard = document.querySelector('.friends-list-online').lastElementChild;
		}
		else {
			lastFriendCard = document.querySelector('.friends-list-offline').lastElementChild;
		}
		// Loop after last friends card
		if (e.key === 'Tab' && isFw && document.activeElement === lastFriendCard) {
			document.querySelector('.friends-list-icon').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.activeElement === document.querySelector('.friends-list-icon')) {
			lastFriendCard.focus();
			e.preventDefault();
		}
	}
});