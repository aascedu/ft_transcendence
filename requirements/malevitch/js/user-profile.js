// Load user profile

async function loadUserContent(id) {
	if (id != g_userId) {
		var	userInfo = await get_user_info(id);

		// Load user general info
		document.querySelector('.user-profile-picture img').setAttribute('src', userInfo.Nick);
		document.querySelector('.user-profile-name').textContent = userInfo.Pic;
	}

	// Display history

	var	history = await get_game_history(id);
	history = history.History;
	var	historyContainer = document.querySelector('.user-profile-history');
	var	numWins = 0;
	var	totalPoints = 0;
	var	totalTime = 0;
	var	score;
	var	opponent;

	for (i = 0; i < history.length; i++) {
		if (history[i].Winner == g_userId) {
			score = history[i]["Winner-score"] + '-' + history[i]["Loser-score"];
			opponent = await get_user_info(history[i].Loser);
			opponent = opponent.Nick;

			historyContainer.insertAdjacentHTML('beforeend', `\
			<div class="content-card d-flex justify-content-center align-items-end purple-shadow">
				<div class="user-profile-history-card-color user-profile-win position-absolute"></div>
				<div class="user-profile-history-card-result">` + score + `</div>
				<div class="user-profile-history-card-event">vs<b> ` + opponent + `</b></div>
			</div>`);

			numWins++;
			totalPoints += history[i]["Loser-score"];
		}
		else {
			score = history[i]["Loser-score"] + '-' + history[i]["Winner-score"];
			opponent = await get_user_info(history[i].Winner);
			opponent = opponent.Nick;

			historyContainer.insertAdjacentHTML('beforeend', `\
			<div class="content-card d-flex justify-content-center align-items-end purple-shadow">
				<div class="user-profile-history-card-color user-profile-lose position-absolute"></div>
				<div class="user-profile-history-card-result">` + score + `</div>
				<div class="user-profile-history-card-event">vs<b> ` + opponent + `</b></div>
			</div>`);

			totalPoints += history[i]["Winner-score"];
		}
		totalTime += history[i].Time;
	}

	if (history.length == 0) {
		document.querySelector('.user-profile-empty-history').classList.remove('visually-hidden');
		document.querySelector('.user-profile-statistics').classList.add('visually-hidden');
		return ;
	}

	// Display stats

	document.querySelector('.user-profile-winrate').textContent = numWins / history.length + '%';
	document.querySelector('.user-profile-points-conceded').textContent = totalScore / history.length;

	var	averageTime;
	var	averageMinutes;
	var	averageSeconds;
	
	averageTime = Math.round(totalTime / history.length);
	averageMinutes = Math.floor(averageTime / 60);
	averageSeconds = averageTime % 60;

	document.querySelector('.user-profile-match-duration').textContent = averageMinutes + ':' + averageSeconds;

	// Current shape graph

	const canvas = document.querySelector('.user-profile-stats-graph');
	if (!canvas.getContext) {
		return;
	}
	canvas.width = canvas.parentElement.offsetWidth;
	canvas.height = `${getCanvasHeight(history)}`;

	g_canvasHeight = canvas.height;

	const ctx = canvas.getContext('2d');

	ctx.strokeStyle = '#7300E6';
	ctx.fillStyle = '#7300E6';
	ctx.lineWidth = 3;

	var	posX = 50;
	var	posY = getCanvasStart(history, canvas.height);
	var	startX = posX;
	var	startY = posY;

	// draw lines
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	for (i = 0; i < history.length; i++) {
		if (history[i].Winner == g_userId) {
			posY += 50;
		}
		else {
			posY -= 50;
		}
		posX++;
		ctx.lineTo(posX, posY);
	}
	ctx.stroke();

	posX = startX;
	posY = startY;

	// draw points
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	for (i = 0; i < history.length; i++) {
		if (history[i].Winner == g_userId) {
			posY += 50;
		}
		else {
			posY -= 50;
		}
		posX++;
		ctx.moveTo(posX, posY);
		ctx.arc(posX, posY, 5, 0, 2*Math.PI);
	}
	ctx.fill();
}

function clearUserContent() {
	// clear history
	document.querySelector('.user-profile-empty-history').classList.add('visually-hidden');
	document.querySelector('.user-profile-statistics').classList.remove('visually-hidden');

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

function getCanvasHeight(history) {
	var	height = 50;
	var	prevResult = 0;
	var	result = 0;
	var	prevStreak = 0;
	var	streak = 0;

	for (i = 0; i < history.length; i++) {
		prevResult = result;
		if (history[i].Winner = g_userId) {
			result = 1;
		}
		else {
			result = 0;
		}
		if (i == 0 || result != prevResult) {
			prevStreak = streak;
			streak = 0;
		}
		streak++;
		if (streak > prevStreak) {
			height += 50;
		}
	}
	return height;
}

function getCanvasStart(history, height) {
	var	result = 0;
	var	min = 0;
	var	max = 0;

	for (i = 0; i < history.length; i++) {
		if (history[i].Winner = g_userId) {
			result++;
		}
		else {
			result--;
		}
		min = result < min ? result : min;
		max = result > max ? result : max;
	}
	if (min == 0) {
		return 0;
	}
	if (max == 0) {
		return height;
	}
	return height - (max * 50);
}

// Modify avatar (check if it is user profile before !)

// Show edit button on hover / focus
document.querySelector('.user-profile-picture').addEventListener('mouseover', function() {
	// You can upload only if the profile is yours.
	if (document.querySelector('.user-profile-name').textContent == g_userNick) {
		document.querySelector('.user-profile-picture label').classList.remove('visually-hidden');
		document.querySelector('.user-profile-picture label').removeAttribute('aria-hidden');
	}
});
document.querySelector('.user-profile-picture').addEventListener('focusin', function() {
	// You can upload only if the profile is yours.
	if (document.querySelector('.user-profile-name').textContent == g_userNick) {
		document.querySelector('.user-profile-picture label').classList.remove('visually-hidden');
		document.querySelector('.user-profile-picture label').removeAttribute('aria-hidden');
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

    fetch('/alfred/user/avatar/' + g_userId, {
        method: 'POST',
        body: formData,
    })
   .then(response => response.json())
   .then(data => {
        console.log('Success:', data);
		document.querySelector('.user-profile-picture > img').setAttribute('src', url);
		document.querySelector('.homepage-header-profile > img').setAttribute('src', url);
		// g_userPic = url;
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
	document.querySelector('.user-profile-image-alert').removeAttribute('aria-hidden');
	document.querySelector('.user-profile-image-alert .alert-confirm-button').focus();
}

// Close alert
document.querySelector('.user-profile-image-alert .alert-confirm-button').addEventListener('click', function() {
	document.querySelector('.user-profile-image-alert').classList.add('visually-hidden');
	document.querySelector('.user-profile-image-alert').setAttribute('aria-hidden', 'true');
});
document.querySelector('.user-profile-image-alert .alert-confirm-button').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		document.querySelector('.user-profile-image-alert').classList.add('visually-hidden');
		document.querySelector('.user-profile-image-alert').setAttribute('aria-hidden', 'true');
	}
});

// Hide edit button on hover / focus
document.querySelector('.user-profile-picture').addEventListener('mouseleave', function() {
	document.querySelector('.user-profile-picture label').classList.add('visually-hidden');
	document.querySelector('.user-profile-picture label').setAttribute('aria-hidden', 'true');
});
document.querySelector('.user-profile-picture').addEventListener('focusout', function() {
	document.querySelector('.user-profile-picture label').classList.remove('visually-hidden');
	document.querySelector('.user-profile-picture label').removeAttribute('aria-hidden');
});

// Ask for confirmation when inviting friend

document.querySelector('.user-profile-add-icon').addEventListener('click', function() {
	document.querySelector('.user-profile-invite-alert').classList.remove('visually-hidden');
	document.querySelector('.user-profile-invite-alert').removeAttribute('aria-hidden');
	document.querySelector('.user-profile-invite-alert .alert-confirm-button').focus();
});

	// Confirm / cancel the invitation

document.querySelector('.user-profile-invite-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');

	inviteSentNotif(document.querySelector('.user-profile-name').textContent);
	document.querySelector('.user-profile-add-icon').classList.add('visually-hidden');
	document.querySelector('.user-profile-pending-icon').classList.remove('visually-hidden');
	setAriaHidden();
});
document.querySelector('.user-profile-invite-alert .alert-confirm-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');

		inviteSentNotif(document.querySelector('.user-profile-name').textContent);
		document.querySelector('.user-profile-add-icon').classList.add('visually-hidden');
		document.querySelector('.user-profile-pending-icon').classList.remove('visually-hidden');
		setAriaHidden();
	}
});

document.querySelector('.user-profile-invite-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');
	document.querySelector('.user-profile-invite-alert').setAttribute('aria-hidden', 'true');
});
document.querySelector('.user-profile-invite-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');
		document.querySelector('.user-profile-invite-alert').setAttribute('aria-hidden', 'true');
	}
});

// Ask for confirmation when removing friend

document.querySelector('.user-profile-remove-icon').addEventListener('click', function() {
	document.querySelector('.user-profile-remove-alert').classList.remove('visually-hidden');
	document.querySelector('.user-profile-remove-alert').removeAttribute('aria-hidden');
	document.querySelector('.user-profile-remove-alert .alert-confirm-button').focus();
});

	// Confirm / cancel the remove

document.querySelector('.user-profile-remove-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');

	document.querySelector('.user-profile-remove-icon').classList.add('visually-hidden');
	document.querySelector('.user-profile-add-icon').classList.remove('visually-hidden');
	setAriaHidden();
});
document.querySelector('.user-profile-remove-alert .alert-confirm-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');

		document.querySelector('.user-profile-remove-icon').classList.add('visually-hidden');
		document.querySelector('.user-profile-add-icon').classList.remove('visually-hidden');
		setAriaHidden();
	}
});

document.querySelector('.user-profile-remove-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');
	document.querySelector('.user-profile-remove-alert').setAttribute('aria-hidden', 'true');
});
document.querySelector('.user-profile-remove-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');
		document.querySelector('.user-profile-remove-alert').setAttribute('aria-hidden', 'true');
	}
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
		document.querySelector('.user-profile-picture label').setAttribute('aria-hidden', 'true');
	}
});
