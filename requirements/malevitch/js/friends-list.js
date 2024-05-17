// Load friends list from db

async function loadFriendsList() {
	var	friendsList = await get_friend(g_userId);
	friendsList = friendsList.Friends;
	
	// If no friends at all
	if (friendsList.length == 0) {
		document.querySelector('.friends-list-online').classList.add('visually-hidden');
		document.querySelector('.friends-list-offline').classList.add('visually-hidden');
		document.querySelector('.friends-list-no-friends').classList.remove('visually-hidden');
		return ;
	}
	
	document.querySelector('.friends-list-online').classList.remove('visually-hidden');
	document.querySelector('.friends-list-offline').classList.remove('visually-hidden');
	document.querySelector('.friends-list-no-friends').classList.add('visually-hidden');

	var	friendsOnline = await get_friend_list_online(g_userId);
	console.log('friendsOnline = ' + friendsOnline);
	// var	friendsOffline = TODO
	var	friendsOnlineContainer = document.querySelector('.friends-list-online');
	var	friendsOfflineContainer = document.querySelector('.friends-list-offline');
	var	friendId;
	var	friendNick;
	var	friendPic;

	// // Friends online
	// document.querySelector('.friends-list-no-online').classList.add('visually-hidden');

	// for (i = 0; i < friendsOnline.length; i++) {
	// 	friendId = friendsOnline[i].Id;
	// 	friendNick = friendsOnline[i].Nick;
	// 	friendPic = friendsOnline[i].Pic;
	// 	if (friendPic == null) {
	// 		friendPic = "/assets/general/pong.png";
	// 	}

	// 	friendsOnlineContainer.insertAdjacentHTML('beforeend', `\
	// 	<button class="content-card d-flex justify-content-between align-items-center purple-shadow" user-id="` + friendId + `">
	// 		<div class="user-card-name unselectable">` + friendNick + `</div>
	// 		<div class="user-card-picture">
	// 			<img src="` + friendPic + `" alt="profile picture of ` + friendNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 	</button>`);
	// }
	// if (friendsOnline.length == 0) {
	// 	document.querySelector('.friends-list-no-online').classList.remove('visually-hidden');
	// }

	// // Friends offline
	// document.querySelector('.friends-list-no-offline').classList.add('visually-hidden');

	// for (i = 0; i < friendsOffline.length; i++) {
	// 	friendId = friendsOffline[i].Id;
	// 	friendNick = friendsOffline[i].Nick;
	// 	friendPic = friendsOffline[i].Pic;
	// 	if (friendPic == null) {
	// 		friendPic = "/assets/general/pong.png";
	// 	}

	// 	friendsOfflineContainer.insertAdjacentHTML('beforeend', `\
	// 	<button class="content-card d-flex justify-content-between align-items-center purple-shadow" user-id="` + friendId + `">
	// 		<div class="user-card-name unselectable">` + friendNick + `</div>
	// 		<div class="user-card-picture">
	// 			<img src="` + friendPic + `" alt="profile picture of ` + friendNick + `" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 	</button>`);
	// }
	// if (friendsOffline.length == 0) {
	// 	document.querySelector('.friends-list-no-offline').classList.remove('visually-hidden');
	// }
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