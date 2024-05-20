// Global variables.
let g_userId;
let	g_userNick;
let	g_userPic = '/assets/general/pong.png';
let	g_prevFontSize = 0;
let	g_jwt;
let	g_refreshToken;
let	g_translations = null;
let g_canvasHeight = 0;

// History routing.

let g_state = {
	pageToDisplay: ".homepage-id"
};

function render() {
	var	pageToDisplay = document.querySelector(g_state.pageToDisplay);
	pageToDisplay.classList.remove('visually-hidden');

	if (g_state.pageToDisplay == '.homepage-game') {
		clearHomepageContent();
		setHomepageContent();

		var	homepageHeader = document.querySelector('.homepage-header');
		homepageHeader.classList.remove('visually-hidden');

		var	homepagePicture = document.querySelector('.homepage-game-picture');
		homepagePicture.classList.remove('visually-hidden');
	}
	if (g_state.pageToDisplay == '.homepage-id') {
		document.querySelector('.homepage-id-input').focus();
	}

	setAriaHidden();

	// A ENLEVER

	// var	homepageHeader = document.querySelector('.homepage-header');
	// homepageHeader.classList.remove('visually-hidden');

	// var	homepagePicture = document.querySelector('.homepage-game-picture');
	// homepagePicture.classList.remove('visually-hidden');
}

window.history.replaceState(g_state, null, "");
render(g_state);

window.addEventListener('popstate', function (event) {
	var	pageToHide = document.querySelector(g_state.pageToDisplay);

	if (event.state) {
		pageToHide.classList.add('visually-hidden');
		switchNextLanguageFromPreviousSelector(g_state.pageToDisplay, event.state.pageToDisplay);
		switchNextFontSizeFromPreviousSelector(g_state.pageToDisplay, event.state.pageToDisplay);
		g_state = event.state;
	}
	render(g_state);
});

function hideEveryPage() {
	document.querySelector('.homepage-game').classList.add('visually-hidden');
	document.querySelector('.friends-list').classList.add('visually-hidden');
	document.querySelector('.my-tournaments').classList.add('visually-hidden');
	document.querySelector('.available-tournaments').classList.add('visually-hidden');
}

function setAriaHidden() {
	document.querySelectorAll('.visually-hidden').forEach(function(item) {
		item.setAttribute('aria-hidden', 'true');
	});
	document.querySelectorAll('[aria-hidden="true"]').forEach(function(item) {
		if (!item.classList.contains('visually-hidden')) {
			item.removeAttribute('aria-hidden');
		}
	});
}

// Translation functions.

function loadTranslations() {
	if (g_translations) {
	   return Promise.resolve(g_translations);
	}

	return fetch('./assets/lang/translations.json')
	   .then(response => response.json())
	   .then(data => {
		 g_translations = data;
		 return g_translations;
	   })
	   .catch(error => console.error(error));
}

function switchLanguageAttr(locale, newAttr) {
	loadTranslations().then(translations => {
		document.querySelectorAll('[data-language]').forEach(element => {
			const key = element.getAttribute('data-language');
			if (element.hasAttribute(newAttr)) {
			element.setAttribute(newAttr, translations[locale][key]);
			}
		});
	});
}

function switchLanguageContent(locale) {
	loadTranslations().then(translations => {
		document.querySelectorAll('[data-language]').forEach(element => {
			const key = element.getAttribute('data-language');
			if (element.textContent.trim() !== '') {
			var info;
			if (element.querySelector('b') !== null) {
				info = element.querySelector('b').innerHTML;
				info = info.replace(/\&nbsp;/g, '');
			}
			element.textContent = translations[locale][key];
			if (info && info.trim() !== '') {
				addInfoToElement(info, element);
			}
			}
		});
	});
}

// Make every language selectors be the same no matter the page.

function switchNextLanguageFromPreviousSelector(previous, next) {
	var	prevSelector = document.querySelector(previous + '-language-selector');

	if (prevSelector !== null) {
		var	prevSelectorImg = prevSelector.firstElementChild.firstElementChild;
		var	locale = prevSelectorImg.getAttribute('alt');

		var	nextSelector = document.querySelector(next + '-language-selector');
		var	nextSelectorImg = nextSelector.firstElementChild.firstElementChild;

		if (nextSelectorImg.getAttribute('alt') !== locale) {
			var	nextSelectorImgSrc = nextSelectorImg.getAttribute('src');
			var	nextSelectorImgAlt = nextSelectorImg.getAttribute('alt');
			var	nextSelectorButtons = document.querySelectorAll(next + '-language-selector ul li a img');

			nextSelectorImg.setAttribute('src', prevSelectorImg.getAttribute('src'));
			nextSelectorImg.setAttribute('alt', locale);
			if (nextSelectorButtons[0].getAttribute('alt') === locale) {
				nextSelectorButtons[0].setAttribute('src', nextSelectorImgSrc);
				nextSelectorButtons[0].setAttribute('alt', nextSelectorImgAlt);
			}
			else if (nextSelectorButtons[1].getAttribute('alt') === locale) {
				nextSelectorButtons[1].setAttribute('src', nextSelectorImgSrc);
				nextSelectorButtons[1].setAttribute('alt', nextSelectorImgAlt);
			}
			else {
				nextSelectorButtons[2].setAttribute('src', nextSelectorImgSrc);
				nextSelectorButtons[2].setAttribute('alt', nextSelectorImgAlt);
			}
		}
	}
}

// Language selector : updates the page language / updates the selector images.

document.querySelectorAll('.language-selector-dropdown').forEach(function(item) {
	item.addEventListener('click', function(event) {
		event.preventDefault();

		var	activeImg = this.parentNode;
		while (!activeImg.classList.contains('language-selector'))
			activeImg = activeImg.parentNode;
		activeImg = activeImg.firstElementChild.firstElementChild;
		var	activeImgSrc = activeImg.src;
		var	activeLang = activeImg.alt;
		var	selectedImg = this.firstElementChild;
		var	selectedLang = selectedImg.getAttribute('alt');

		switchLanguageAttr(selectedLang, 'placeholder');
		switchLanguageContent(selectedLang);
		activeImg.setAttribute('src', selectedImg.getAttribute('src'));
		activeImg.setAttribute('alt', selectedLang);
		selectedImg.setAttribute('src', activeImgSrc);
		selectedImg.setAttribute('alt', activeLang);

		// change lang of user in db
		if (item.closest('.language-selector').classList.contains('homepage-header-language-selector')) {
			patch_user_info(g_userId, selectedLang, null, null, null, null);
		}

		// switch back focus to main button
		var	itemButton = item.closest('.language-selector').querySelector('.dropdown');
		itemButton.focus();
	});
});

// Input box focus.

document.querySelectorAll('.input').forEach(function(item) {
	item.addEventListener('focus', function() {
		this.parentNode.classList.add('input-box-focused');
	})
});

document.querySelectorAll('.input').forEach(function(item) {
	item.addEventListener('blur', function() {
		this.parentNode.classList.remove('input-box-focused');
	})
});

// Nickname checking functions

function nicknameValidChar(nickname) {
	let regex = /[^A-Za-z0-9_]/g;
	return !regex.test(nickname);
}

function warnInvalidNickname(nickname, element) {
	if (!nicknameValidChar(nickname)) {
		element.setAttribute('data-language', 'nickname-invalid-char');
		return false;
	}
	else if (nickname.length < 3) {
		element.setAttribute('data-language', 'nickname-too-short');
		return false;
	}
	else if (nickname.length > 15) {
		element.setAttribute('data-language', 'nickname-too-long');
		return false;
	}
	return true;
}

// Tournament name checking functions

function tournamentValidChar(name) {
	let regex = /[^A-Za-z0-9_ ]/g;
	return !regex.test(name);
}

function warnInvalidTournamentName(name, element) {
	if (!tournamentValidChar(name)) {
		element.setAttribute('data-language', 'tournament-name-invalid-char');
		return false;
	}
	else if (name.length < 3) {
		element.setAttribute('data-language', 'tournament-name-too-short');
		return false;
	}
	else if (name.length > 23) {
		element.setAttribute('data-language', 'tournament-name-too-long');
		return false;
	}
	return true;
}

//

function addInfoToElement(info, element) {
	element.innerHTML = element.innerHTML.split('<b')[0];
	element.innerHTML = element.textContent + '<b>&nbsp;' + info + '&nbsp;</b>!';
	updateFontSize(element.querySelector('b'), g_prevFontSize);
}

// Password eye icons

document.querySelectorAll('.input-box button').forEach(function(item) {
	item.addEventListener('click', function() {
		togglePasswordView(item.parentNode);
	})
});

function togglePasswordView(container) {
	var	input = container.querySelector('input');
	var	icon = container.querySelector('button img');

	if (input.getAttribute('type') == 'password') {
		input.setAttribute('type', 'text');
		icon.setAttribute('src', 'assets/auth/hidden-purple.png');
	}
	else {
		input.setAttribute('type', 'password');
		icon.setAttribute('src', 'assets/auth/view-purple.png');
	}
}

// Font size functions

document.querySelectorAll('.font-size-input').forEach(function(item) {
	item.addEventListener('input', function () {
		var	newSize = this.value;

		updateFontSizeOfPage(document.querySelector('body'), newSize - g_prevFontSize);
		g_prevFontSize = newSize;

		if (item.classList.contains('accessibility-font-size')) {
			patch_user_info(g_userId, null, newSize, null, null, null);
		}
	});
});

function updateFontSize(element, difference) {
	var computedStyle = window.getComputedStyle(element);
	var fontSizeInPx = parseFloat(computedStyle.fontSize);
	var fontSizeInPt = fontSizeInPx * (72 / 96);
	fontSizeInPt += 2 * difference;
	var newFontSizeInPx = fontSizeInPt * (96 / 72);
	element.style.fontSize = newFontSizeInPx + "px";
}

function updateFontSizeOfPage(element, size) {
	var	computedStyle = window.getComputedStyle(element);
	var	elementFontSize = computedStyle.fontSize;
	if (elementFontSize !== '' && parseFloat(elementFontSize) > 0) {
		updateFontSize(element, size);
	}

	for (let child of element.children) {
		updateFontSizeOfPage(child, size);
	}
}

function switchNextFontSizeFromPreviousSelector(previous, next) {
	var	prevFontSizeInput = document.querySelector(previous + '-font-size');

	if (prevFontSizeInput !== null) {
		var	nextFontSizeInput = document.querySelector(next + '-font-size');

		nextFontSizeInput.value = prevFontSizeInput.value;

		// updateFontSizeOfPage(document.querySelector(next), nextFontSizeInput.value);
	}
}

// update homepage content

function clearHomepageContent() {
	// clear friend list
	document.querySelectorAll('.homepage-friend-content-card-container .content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});
	document.querySelector('.homepage-game-content-no-friends').classList.add('visually-hidden');

	// clear history
	document.querySelectorAll('.homepage-history-content-card-container .content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});
	document.querySelectorAll('.homepage-game-content-empty-history').forEach(function(item) {
		item.classList.add('visually-hidden');
	});

	// clear stats
	document.querySelectorAll('.homepage-stats-content-card-container .content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});
}

async function setHomepageContent() {
	const userInfo = await get_user_info(g_userId);

	// change lang if needed
	var	locale = document.querySelector('.homepage-header-language-selector button img').getAttribute('alt');
	if (userInfo.Lang != locale) {
		var	localeImg = document.querySelector('.homepage-header-language-selector button img');
		var	localeImgSrc = localeImg.getAttribute('src');

		document.querySelectorAll('.homepage-header-language-selector img').forEach(function(item) {
			if (item.getAttribute('alt') == userInfo.Lang) {
				var	userLangBtn = item;
				var	userLangImg = item.getAttribute('src');

				userLangBtn.setAttribute('alt', locale);
				localeImg.setAttribute('alt', userInfo.Lang);
				localeImg.setAttribute('src', userLangImg);
				userLangBtn.setAttribute('src', localeImgSrc);
			}
		});
		switchLanguageAttr(userInfo.Lang, 'placeholder');
		switchLanguageContent(userInfo.Lang);
	}

	// change font if needed
	if (userInfo.Font != g_prevFontSize) {
		updateFontSizeOfPage(document.querySelector('body'), userInfo.Font);
		g_prevFontSize = userInfo.Font;
	}
	document.querySelector('.accessibility-font-size').value = userInfo.Font;

	// change contrast mode if needed
	if (userInfo["Contrast-mode"] == true) {
		contrastMode();
		document.querySelector('.accessibility .switch input').checked = true;
	}

	// change pic if needed
	if (userInfo.Pic != null) {
		document.querySelector('.homepage-header-profile img').setAttribute('src', userInfo.Pic);
		g_userPic = userInfo.Pic;
	}

	// show friends
	var	friendsList = await get_friend(g_userId);
	friendsList = friendsList.Friends;

	var	friendsOnline = await get_friend_list_online(g_userId);
	friendsOnline = friendsOnline["online-status"];

	var	friendsOnlineContainer = document.querySelector('.homepage-friend-content-card-container');
	var	numOfFriendsOnline = 0;
	var	friendId;
	var	friendNick;
	var	friendPic;
	
	for (i = 0; i < friendsList.length; i++) {
		if (friendsOnline[friendsList[i].Id] == true) {

			friendId = friendsList[i].Id;
			friendNick = friendsList[i].Nick;
			friendPic = friendsList[i].Pic;
			if (friendPic == null) {
				friendPic = '/assets/general/pong.png';
			}
			
			friendsOnlineContainer.insertAdjacentHTML('beforeend', `\
			<button class="content-card w-100 d-flex justify-content-between align-items-center purple-shadow" user-id="` + friendId + `">
			<div class="user-card-name unselectable">` + friendNick + `</div>
			<div class="user-card-picture">
			<img src="` + friendPic + `" alt="profile picture of ` + friendNick + `" draggable="false" (dragstart)="false;" class="unselectable">
			</div>
			</button>`);

			numOfFriendsOnline++;
		}
	}
	if (friendsList.length == 0 || numOfFriendsOnline == 0) {
		document.querySelector('.homepage-game-content-no-friends').classList.remove('visually-hidden');
	}

	// History and stats

	var	history = await get_game_history(g_userId);
	history = history.History;
	var	historyContainer = document.querySelector('.homepage-history-content-card-container');
	var	numWins = 0;
	var	totalPoints = 0;
	var	totalTime = 0;
	var	score;
	var	opponent;

	document.querySelectorAll('.homepage-game-content-empty-history').forEach(function(item) {
		item.classList.add('visually-hidden');
	});

	for (i = 0; i < history.length; i++) {
		if (history[i].Winner == g_userId) {
			score = history[i]["Winner-score"] + '-' + history[i]["Loser-score"];
			opponent = await get_user_info(history[i].Loser);
			opponent = opponent.Nick;

			historyContainer.insertAdjacentHTML('beforeend', `\
			<div class="content-card w-100 d-flex justify-content-center align-items-end purple-shadow">
				<div class="homepage-game-content-history-card-color homepage-history-win position-absolute"></div>
				<div class="homepage-game-content-history-card-result">` + score + `</div>
				<div class="homepage-game-content-history-card-event">vs<b> ` + opponent + `</b></div>
			</div>`);

			numWins++;
			totalPoints += history[i]["Loser-score"];
		}
		else {
			score = history[i]["Loser-score"] + '-' + history[i]["Winner-score"];
			opponent = await get_user_info(history[i].Winner);
			opponent = opponent.Nick;

			historyContainer.insertAdjacentHTML('beforeend', `\
			<div class="content-card w-100 d-flex justify-content-center align-items-end purple-shadow">
				<div class="homepage-game-content-history-card-color homepage-history-lose position-absolute"></div>
				<div class="homepage-game-content-history-card-result">` + score + `</div>
				<div class="homepage-game-content-history-card-event">vs<b> ` + opponent + `</b></div>
			</div>`);

			totalPoints += history[i]["Winner-score"];
		}
		totalTime += history[i].Time;
	}

	if (history.length == 0) {
		document.querySelectorAll('.homepage-game-content-empty-history').forEach(function(item) {
			item.classList.remove('visually-hidden');
		});
		return ;
	}

	// Display stats

	var	statsContainer = document.querySelector('.homepage-stats-content-card-container');

	// Winrate
	statsContainer.insertAdjacentHTML('beforeend', `\
	<div class="content-card w-100 d-flex justify-content-between align-items-center purple-shadow">
		<div class="homepage-game-content-stats-card-stat unselectable">` + (numWins / history.length) * 100 + `%</div>
		<div class="homepage-game-content-stats-card-context unselectable" data-language="winrate">Win rate</div>
	</div>`);

	// Average conceded points
	statsContainer.insertAdjacentHTML('beforeend', `\
	<div class="content-card w-100 d-flex justify-content-between align-items-center purple-shadow">
		<div class="homepage-game-content-stats-card-stat unselectable">` + (totalPoints / history.length) + `</div>
		<div class="homepage-game-content-stats-card-context unselectable" data-language="points-conceded">Average conceded points</div>
	</div>`);

	var	averageTime;
	var	averageMinutes;
	var	averageSeconds;
	
	averageTime = Math.round(totalTime / history.length);
	averageMinutes = Math.floor(averageTime / 60);
	averageSeconds = averageTime % 60;

	// Average match duration
	statsContainer.insertAdjacentHTML('beforeend', `\
	<div class="content-card w-100 d-flex justify-content-between align-items-center purple-shadow">
		<div class="homepage-game-content-stats-card-stat unselectable">` + (averageMinutes + `:` + averageSeconds) + `</div>
		<div class="homepage-game-content-stats-card-context unselectable" data-language="match-duration">Average match duration</div>
	</div>`);
}

function goToHomepageGame(previous) {
	clearHomepageContent();
	setHomepageContent();

	// hide previous and display homepage content
	var prevPage = document.querySelector(previous);
	prevPage.classList.add('visually-hidden');

	var	homepageHeader = document.querySelector('.homepage-header');
	homepageHeader.classList.remove('visually-hidden');

	var	homepagePicture = document.querySelector('.homepage-game-picture');
	homepagePicture.classList.remove('visually-hidden');

	document.querySelector('.homepage-header-logo').focus();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
}

//

function leaveTournamentEditMode() {
	// Switch button appearance
	document.querySelector('.tournament-info-check-icon').classList.add('visually-hidden');
	document.querySelector('.tournament-info-edit-icon').classList.remove('visually-hidden');

	// Hide kick buttons
	document.querySelectorAll('.tournament-kick-player').forEach(item => {
		item.classList.add('visually-hidden');
	});

	// Hide edit tournament name
	document.querySelector('.tournament-info-name-input-container').classList.add('visually-hidden');

	// Show tournament name
	document.querySelector('.tournament-info-name').classList.remove('visually-hidden');

	setAriaHidden();
}

// Hide alerts when clicking outside

document.querySelectorAll('.alert').forEach(function(item) {
	item.addEventListener('click', function(event) {
		if (this !== event.target) {
			return ;
		}
		item.classList.add('visually-hidden');
		setAriaHidden();
	});
});

//

function hideEveryPage() {
	document.querySelector('.homepage-game').classList.add('visually-hidden');
	document.querySelector('.friends-list').classList.add('visually-hidden');
	document.querySelector('.my-tournaments').classList.add('visually-hidden');
	document.querySelector('.available-tournaments').classList.add('visually-hidden');
	document.querySelector('.tournament-info').classList.add('visually-hidden');
	// Leave tournament info edit mode
	if (!document.querySelector('.tournament-info-name-input-container').classList.contains('visually-hidden')) {
		leaveTournamentEditMode();
	}
	document.querySelector('.user-profile').classList.add('visually-hidden');
	document.querySelector('.victory-defeat').classList.add('visually-hidden');
	// Automatically cancel tournament creation if there was one
	resetTournamentCreation();
	document.querySelector('.accessibility').classList.add('visually-hidden');
}
