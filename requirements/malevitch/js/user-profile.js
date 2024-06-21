// Load user profile

async function loadUserContent(id) {
	var	playIcon = document.querySelector('.user-profile-play-icon');
	var	addIcon = document.querySelector('.user-profile-add-icon');
	var	pendingIcon = document.querySelector('.user-profile-pending-icon');
	var	removeIcon = document.querySelector('.user-profile-remove-icon');
	var	disconnectIcon = document.querySelector('.user-profile-disconnect-icon');
	var	editIcon = document.querySelector('.user-profile-edit-icon');

	var userInfo;
	var userNick = 'User';
	var userPic = 'assets/general/pong.png';

	document.querySelector('.user-profile-name').setAttribute('user-id', id);

	if (id != g_userId) {
		try {
			userInfo = await get_user_info(id);
			userNick = userInfo.Nick;
			userPic = userInfo.Pic;
			if (userPic == null) {
				userPic = 'assets/general/pong.png';
			}
		} catch (error) {
			console.error();
		}

		var	friendsInfo;
		var isFriend = false;
		var	isAvailable = false;
		var	isInvited = false;

		try {
			friendsInfo = await get_friend(g_userId);
			var	friendsList = friendsInfo.Friends;
			var	friendsInvited = friendsInfo.Sent;
			for (i = 0; i < friendsList.length; i++) {
				if (friendsList[i].Id == id) {
					isFriend = true;
					break ;
				}
			}
			for (i = 0; i < friendsInvited.length; i++) {
				if (friendsInvited[i].Id == id) {
					isInvited = true;
					break ;
				}
			}
		} catch (error) {
			console.error(error);
		}

		if (isFriend) {
			try {
				var	availableFriends = await get_available_friends();
				availableFriends = availableFriends.Ava;

				for (i = 0; i < availableFriends.length; i++) {
					if (availableFriends[i].Id == id) {
						isAvailable = true;
						break ;
					}
				}
				if (isAvailable) {
					playIcon.classList.remove('visually-hidden');
				}
				else {
					playIcon.classList.add('visually-hidden');
				}
				addIcon.classList.add('visually-hidden');
				pendingIcon.classList.add('visually-hidden');
				removeIcon.classList.remove('visually-hidden');
			} catch (error) {
				console.error();
			}
		}
		else if (isInvited) {
			playIcon.classList.add('visually-hidden');
			addIcon.classList.add('visually-hidden');
			pendingIcon.classList.remove('visually-hidden');
			removeIcon.classList.add('visually-hidden');
		}
		else {
			playIcon.classList.add('visually-hidden');
			addIcon.classList.remove('visually-hidden');
			pendingIcon.classList.add('visually-hidden');
			removeIcon.classList.add('visually-hidden');
		}

		addIcon.setAttribute('user-id', id);
		removeIcon.setAttribute('user-id', id);
		disconnectIcon.classList.add('visually-hidden');
		editIcon.classList.add('visually-hidden');
	}
	else {
		userNick = g_userNick;
		userPic = g_userPic;

		addIcon.classList.add('visually-hidden');
		addIcon.removeAttribute('user-id');
		pendingIcon.classList.add('visually-hidden');
		removeIcon.classList.add('visually-hidden');
		removeIcon.removeAttribute('user-id');
		disconnectIcon.classList.remove('visually-hidden');
		editIcon.classList.remove('visually-hidden');
	}
	// Load user general info
	document.querySelector('.user-profile-picture img').setAttribute('src', userPic);
	document.querySelector('.user-profile-name').textContent = userNick;

	// Display history

	var	history;

	try {
		history = await get_game_history(id);
		history = history.History;
	} catch (error) {
		console.error(error);
		document.querySelector('.user-profile-empty-history').classList.remove('visually-hidden');
		document.querySelector('.user-profile-statistics').classList.add('visually-hidden');
		return ;
	}

	if (history.length == 0) {
		document.querySelector('.user-profile-empty-history').classList.remove('visually-hidden');
		document.querySelector('.user-profile-statistics').classList.add('visually-hidden');
		return ;
	}
	else {
		document.querySelector('.user-profile-empty-history').classList.add('visually-hidden');
		document.querySelector('.user-profile-statistics').classList.remove('visually-hidden');
	}

	var	historyContainer = document.querySelector('.user-profile-history');
	var	numWins = 0;
	var	totalPoints = 0;
	var	totalTime = 0;
	var	score;
	var	opponent;

	for (i = history.length - 1; i >= 0; i--) {
		if (history[i].Winner == id) {
			score = history[i]["Winner-score"] + '-' + history[i]["Loser-score"];
			try {
				opponent = await get_user_info(history[i].Loser);
				opponent = opponent.Nick;
			} catch (error) {
				console.error(error);

				var	historyToRemove = document.querySelector('.user-profile-history');
				historyToRemove.querySelectorAll('.content-card').forEach(function(item) {
					item.parentElement.removeChild(item);
				});

				document.querySelector('.user-profile-empty-history').classList.remove('visually-hidden');
				document.querySelector('.user-profile-statistics').classList.add('visually-hidden');
				return ;
			}

			historyContainer.insertAdjacentHTML('beforeend', `\
			<div class="content-card d-flex justify-content-center align-items-end purple-shadow">
				<div class="user-profile-history-card-color user-profile-win position-absolute"></div>
				<div class="user-profile-history-card-result unselectable">` + score + `</div>
				<div class="user-profile-history-card-event unselectable">vs<b> ` + opponent + `</b></div>
			</div>`);

			numWins++;
			totalPoints += history[i]["Loser-score"];
		}
		else {
			score = history[i]["Loser-score"] + '-' + history[i]["Winner-score"];
			try {
				opponent = await get_user_info(history[i].Winner);
				opponent = opponent.Nick;
			} catch (error) {
				console.error(error);

				var	historyToRemove = document.querySelector('.user-profile-history');
				historyToRemove.querySelectorAll('.content-card').forEach(function(item) {
					item.parentElement.removeChild(item);
				});

				document.querySelector('.user-profile-empty-history').classList.remove('visually-hidden');
				document.querySelector('.user-profile-statistics').classList.add('visually-hidden');
				return ;
			}

			historyContainer.insertAdjacentHTML('beforeend', `\
			<div class="content-card d-flex justify-content-center align-items-end purple-shadow">
				<div class="user-profile-history-card-color user-profile-lose position-absolute"></div>
				<div class="user-profile-history-card-result unselectable">` + score + `</div>
				<div class="user-profile-history-card-event unselectable">vs<b> ` + opponent + `</b></div>
			</div>`);

			totalPoints += history[i]["Winner-score"];
		}
		totalTime += history[i].Duration;
	}

	// Display stats

	document.querySelector('.user-profile-winrate').textContent = Math.round((numWins / history.length + Number.EPSILON) * 100) + '%';
	document.querySelector('.user-profile-points-conceded').textContent = Math.round((totalPoints / history.length + Number.EPSILON) * 100) / 100;

	var	averageTime;
	var	averageMinutes;
	var	averageSeconds;

	averageTime = Math.round(totalTime / history.length);
	averageMinutes = Math.floor(averageTime / 60);
	averageSeconds = averageTime % 60;
	if (averageSeconds < 10) {
		averageSeconds = averageSeconds.toString().padStart(2, '0');
	}

	document.querySelector('.user-profile-match-duration').textContent = averageMinutes + ':' + averageSeconds;

	// Current shape graph

	var	spacing = 50;

	const canvas = document.querySelector('.user-profile-stats-graph');
	if (!canvas.getContext) {
		return;
	}
	canvas.width = canvas.parentElement.offsetWidth;
	canvas.height = `${getCanvasHeight(id, history, spacing)}`;

	g_canvasHeight = canvas.height;

	const ctx = canvas.getContext('2d');

	ctx.strokeStyle = '#7300E6';
	ctx.fillStyle = '#7300E6';
	ctx.lineWidth = 3;

	var	posX = 40;
	var	posY = getCanvasStart(id, history, canvas.height, spacing) - 25;
	var	startX = posX;
	var	startY = posY;

	// draw lines
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	for (i = history.length - 1; i >= 0; i--) {
		if (history[i].Winner == id) {
			posY -= spacing;
		}
		else {
			posY += spacing;
		}
		posX += spacing;
		ctx.lineTo(posX, posY);
	}
	ctx.stroke();

	posX = startX;
	posY = startY;

	// draw points
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.arc(startX, startY, 5, 0, 2*Math.PI);
	for (i = history.length - 1; i >= 0; i--) {
		if (history[i].Winner == id) {
			posY -= spacing;
		}
		else {
			posY += spacing;
		}
		posX += spacing;
		ctx.moveTo(posX, posY);
		ctx.arc(posX, posY, 5, 0, 2*Math.PI);
	}
	ctx.fill();
}

function clearUserContent() {
	// Switch button appearance
	document.querySelector('.user-profile-check-icon').classList.add('visually-hidden');
	document.querySelector('.user-profile-edit-icon').classList.remove('visually-hidden');

	// Hide edit nickname
	document.querySelector('.user-profile-name-input-container').classList.add('visually-hidden');

	// Show nickname
	document.querySelector('.user-profile-name').classList.remove('visually-hidden');

	setAriaHidden();

    // clear history
	document.querySelector('.user-profile-empty-history').classList.remove('visually-hidden');
	document.querySelector('.user-profile-statistics').classList.add('visually-hidden');

	var	historyContainer = document.querySelector('.user-profile-history');

	historyContainer.querySelectorAll('.content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});

	// clear stats graph

	const canvas = document.querySelector('.user-profile-stats-graph');
	if (!canvas.getContext) {
		console.error('Can\'t erase graph');
		return;
	}
	canvas.width = canvas.parentElement.offsetWidth;
	canvas.height = `${g_canvasHeight}`;

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getCanvasHeight(id, history, spacing) {
	var	result = 0;
	var	min = 0;
	var	max = 0;

	for (i = history.length - 1; i >= 0; i--) {
		if (history[i].Winner == id) {
			result++;
		}
		else {
			result--;
		}
		min = result < min ? result : min;
		max = result > max ? result : max;
	}
	return ((max - min) * spacing) + spacing;
}

function getCanvasStart(id, history, height, spacing) {
	var	result = 0;
	var	min = 0;
	var	max = 0;

	for (i = history.length - 1; i >= 0; i--) {
		if (history[i].Winner == id) {
			result++;
		}
		else {
			result--;
		}
		min = result < min ? result : min;
		max = result > max ? result : max;
	}
	if (min == 0) {
		return height;
	}
	if (max == 0) {
		return spacing;
	}
	return (max * spacing) + spacing;
}

// Modify avatar (check if it is user profile before !)

// Show edit button on hover / focus
document.querySelector('.user-profile-picture').addEventListener('mouseover', function() {
	// You can upload only if the profile is yours.
	if (document.querySelector('.user-profile-name').textContent == g_userNick) {
		document.querySelector('.user-profile-picture label').classList.remove('visually-hidden');
		setAriaHidden();
	}
});
document.querySelector('.user-profile-picture').addEventListener('focusin', function() {
	// You can upload only if the profile is yours.
	if (document.querySelector('.user-profile-name').textContent == g_userNick) {
		document.querySelector('.user-profile-picture label').classList.remove('visually-hidden');
		setAriaHidden();
	}
});

// Upload an image and check its size
document.querySelector('.user-profile-picture input').addEventListener('change', function(event) {
	var	file = event.target.files[0];
	var	maxSize = 1024 * 1024 * 10; // 10MB
	var	maxWidth = 2000;
	var	maxHeight = 2000;
	var	minWidth = 200;
	var	minHeight = 200;

	if (file) {
		if (file.size > maxSize) {
			sendImageAlert("max-image-weight");
			event.target.value = '';
		}
		var	reader = new FileReader();
		reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
				if (this.width > maxWidth || this.height > maxHeight) {
					sendImageAlert("max-image-size");
					e.target.value = '';
				}
				else if (this.width < minWidth || this.height < minHeight) {
					sendImageAlert("min-image-size");
					e.target.value = '';
				}
				else {
					var	url = reader.result;
					uploadImageToDB(file, url);
				}
        	};
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
	}
});

function uploadImageToDB(file, url) {
    var formData = new FormData();
    formData.append('avatar', file, file.name);

    post_avatar(formData)
   .then(response => response.json())
   .then(data => {
        console.log('Success:', data);
		document.querySelector('.user-profile-picture > img').setAttribute('src', url);
		document.querySelector('.homepage-header-profile > img').setAttribute('src', url);
		g_userPic = data.Pic;
    })
   .catch((error) => {
        console.error('Error:', error);
    });
}

// Send correct alert if image does not respect max / min size
function sendImageAlert(data) {
	document.querySelector('.user-profile-image-alert .alert-message').setAttribute('data-language', data);
	var locale = document.querySelector('.homepage-header-language-selector button img').alt;
	switchLanguageContent(locale);
	document.querySelector('.user-profile-image-alert').classList.remove('visually-hidden');
	setAriaHidden();
	document.querySelector('.user-profile-image-alert .alert-confirm-button').focus();
}

// Close alert
document.querySelector('.user-profile-image-alert .alert-confirm-button').addEventListener('click', function() {
	document.querySelector('.user-profile-image-alert').classList.add('visually-hidden');
	setAriaHidden();
});
document.querySelector('.user-profile-image-alert .alert-confirm-button').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		document.querySelector('.user-profile-image-alert').classList.add('visually-hidden');
		setAriaHidden();
	}
});

// Hide edit button on hover / focus
document.querySelector('.user-profile-picture').addEventListener('mouseleave', function() {
	document.querySelector('.user-profile-picture label').classList.add('visually-hidden');
	setAriaHidden();
});
document.querySelector('.user-profile-picture').addEventListener('focusout', function() {
	document.querySelector('.user-profile-picture label').classList.remove('visually-hidden');
	setAriaHidden();
});

// Edit nickname
document.querySelector('.user-profile-edit-icon').addEventListener('click', function () {
	// Switch button appearance
	document.querySelector('.user-profile-edit-icon').classList.add('visually-hidden');
	document.querySelector('.user-profile-check-icon').classList.remove('visually-hidden');

	// Hide old nickname
	document.querySelector('.user-profile-name').classList.add('visually-hidden');

	// Reveal edit nickname with nickname as default value
	var	nickname = document.querySelector('.user-profile-name').textContent;
	var nicknameInput = document.querySelector('.user-profile-name-input');

	nicknameInput.value = nickname;
	document.querySelector('.user-profile-name-input-container').classList.remove('visually-hidden');
	nicknameInput.focus();
	setAriaHidden();
});

// Leave edit mode

async function checkToLeaveNicknameEditMode() {
	// Check if new nickname is correct
	var	nicknameInput = document.querySelector('.user-profile-name-input');
	var	nicknameInputWarning = document.querySelector('.user-profile-name-input-warning');

    const nickAvailability = await warnUnavailableUserInfo(nicknameInput.value, 'nickname', nicknameInputWarning);
	if (!warnInvalidNickname(nicknameInput.value, nicknameInputWarning) || (!nickAvailability && nicknameInput.value != g_userNick)) {
		// Show warning
		var locale = document.querySelector('.homepage-header-language-selector button img').alt;
		switchLanguageContent(locale);
		nicknameInputWarning.classList.remove('visually-hidden');
	}
	else {
		// Show alert
		document.querySelector('.user-profile-edit-alert').classList.remove('visually-hidden');
		document.querySelector('.user-profile-edit-alert .alert-confirm-button').focus();
	}
	setAriaHidden();
}

// Leave edit mode using button
document.querySelector('.user-profile-check-icon').addEventListener('click', function () {
	checkToLeaveNicknameEditMode();
});

// Leave edit mode using enter key

document.querySelector('.user-profile-name-input').addEventListener('keypress', function(event) {
	if (event.key === 'Enter') {
		checkToLeaveNicknameEditMode();
	}
});

// Confirm / cancel the leaving

document.querySelector('.user-profile-edit-alert .alert-confirm-button').addEventListener('click', async function () {
	await changeNickname();
	leaveNicknameEditMode();
});

document.querySelector('.user-profile-edit-alert .alert-confirm-button').addEventListener('keypress', async function (event) {
	if (event.key === 'Enter') {
		await changeNickname();
		leaveNicknameEditMode();
	}
});

async function changeNickname() {
	var	nicknameInput = document.querySelector('.user-profile-name-input');

	try {
		await patch_user_info(g_userId, null, null, nicknameInput.value, null, null);
	} catch (error) {
		console.error(error);
		return ;
	}
	g_userNick = nicknameInput.value;

	// Hide alert
	document.querySelector('.user-profile-edit-alert').classList.add('visually-hidden');
	setAriaHidden();

	// Update profile name
	document.querySelector('.user-profile-name').textContent = nicknameInput.value;
}

function leaveNicknameEditMode() {
	// Switch button appearance
	document.querySelector('.user-profile-check-icon').classList.add('visually-hidden');
	document.querySelector('.user-profile-edit-icon').classList.remove('visually-hidden');

	// Hide edit nickname
	document.querySelector('.user-profile-name-input-container').classList.add('visually-hidden');

	// Show nickname
	document.querySelector('.user-profile-name').classList.remove('visually-hidden');

	setAriaHidden();
}

document.querySelector('.user-profile-edit-alert .alert-cancel-button').addEventListener('click', function () {
	// Hide alert
	document.querySelector('.user-profile-edit-alert').classList.add('visually-hidden');
	setAriaHidden();
});

document.querySelector('.user-profile-edit-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		// Hide alert
		document.querySelector('.user-profile-edit-alert').classList.add('visually-hidden');
		setAriaHidden();
	}
});

// Ask for confirmation when inviting friend

document.querySelector('.user-profile-add-icon').addEventListener('click', function() {
	document.querySelector('.user-profile-invite-alert').classList.remove('visually-hidden');
	setAriaHidden();
	document.querySelector('.user-profile-invite-alert .alert-confirm-button').focus();
});

	// Confirm / cancel the invitation

document.querySelector('.user-profile-invite-alert .alert-confirm-button').addEventListener('click', async function () {
	await userProfileFriendInvite();
});
document.querySelector('.user-profile-invite-alert .alert-confirm-button').addEventListener('keypress', async function (event) {
	if (event.key === 'Enter') {
		await userProfileFriendInvite();
	}
});

document.querySelector('.user-profile-invite-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');
	setAriaHidden();
});
document.querySelector('.user-profile-invite-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');
		setAriaHidden();
	}
});

async function userProfileFriendInvite() {
	try {
		var	friendRequests = await get_friend(g_userId);
		friendRequests = friendRequests.Requests;
		var	hasInvitedMe = false;

		for (i = 0; i < friendRequests.length; i++) {
			if (friendRequests[i].Id == invitedId) {
				hasInvitedMe = true;
				break ;
			}
		}
		if (hasInvitedMe) {
			document.querySelector('.user-profile-remove-icon').classList.remove('visually-hidden');
		}
		else {
			inviteSentNotif(document.querySelector('.user-profile-name').textContent);
			document.querySelector('.user-profile-pending-icon').classList.remove('visually-hidden');
		}

		var invitedId = document.querySelector('.user-profile-add-icon').getAttribute('user-id');
		await post_friend(invitedId);

	} catch (error) {
		console.error(error);
		return ;
	}

	document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');
	document.querySelector('.user-profile-add-icon').classList.add('visually-hidden');

	setAriaHidden();
}

// Ask for confirmation when removing friend

document.querySelector('.user-profile-remove-icon').addEventListener('click', function() {
	document.querySelector('.user-profile-remove-alert').classList.remove('visually-hidden');
	setAriaHidden();
	document.querySelector('.user-profile-remove-alert .alert-confirm-button').focus();
});

	// Confirm / cancel the remove

document.querySelector('.user-profile-remove-alert .alert-confirm-button').addEventListener('click', async function () {
	await userProfileFriendRemove();
});
document.querySelector('.user-profile-remove-alert .alert-confirm-button').addEventListener('keypress', async function(event) {
	if (event.key === 'Enter') {
		await userProfileFriendRemove();
	}
});

document.querySelector('.user-profile-remove-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');
	setAriaHidden();
});
document.querySelector('.user-profile-remove-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');
		setAriaHidden();
	}
});

async function userProfileFriendRemove() {

	try {
		var removedId = document.querySelector('.user-profile-remove-icon').getAttribute('user-id');
		await delete_friend(removedId);
	} catch (error) {
		console.error(error);
		return ;
	}

	document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');

	document.querySelector('.user-profile-remove-icon').classList.add('visually-hidden');
	document.querySelector('.user-profile-add-icon').classList.remove('visually-hidden');
	document.querySelector('.user-profile-play-icon').classList.add('visually-hidden');
	setAriaHidden();
}

// Invite friend to play

document.querySelector('.user-profile-play-icon').addEventListener('click', async function() {
	try {
		// send invite to friend
		var	friendId = document.querySelector('.user-profile-name').getAttribute('user-id');
		await invite_friend_to_game(friendId);
	} catch (error) {
		console.error(error);
		return ;
	}

	this.classList.add('visually-hidden');
});

// Disconnect
//

async function disconnect() {
	hideEveryPage();
	clearHomepageId();
    await delete_cookies();
    document.querySelector('.homepage-id-input').focus();
    window.history.pushState(g_state, null, "");
    await reset_global();
    render(g_state);
}

document.querySelector('.user-profile-disconnect-icon').addEventListener('click', async function() {
    await disconnect();
});

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.user-profile').classList.contains('visually-hidden')) {
		if (e.key === 'Tab') {
			document.querySelector('.homepage-header-logo').focus();
			e.preventDefault();
		}
	}
});

document.addEventListener('focusout', function(e) {
	if (e.target === document.querySelector('.user-profile-picture-input')) {
		document.querySelector('.user-profile-picture label').classList.add('visually-hidden');
		setAriaHidden();
	}
});
