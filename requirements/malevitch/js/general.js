// Global variables.
let g_userId = null;
let	g_userNick = null;
let	g_userPic = '/assets/general/pong.png';
let	g_prevFontSize = 0;
let	g_translations = null;
let	g_canvasHeight = 0;
let g_refreshInterval;
let g_sessionSocket = null;
let g_tournamentSocket = null;
let g_matchmakingSocket = null;
let	g_gameSocket = null;
let g_state = {pageToDisplay : '.homepage-id'};
let g_invited = false;
let	g_gameInviteTimer = null;

// Constant
const JWT_NAME = 'Auth'
const REFRESH_TOKEN_EXPIRED_ERROR = 'error: refresh token expired'
const REF_TOKEN_NAME = 'Ref'

// Constant function
const delay = ms => new Promise(res => setTimeout(res, ms));

// History routing.

window.history.replaceState(g_state, null, "");

async function assign_global() {
    return get_personal_info().then(data => {
                g_userId = data.Id;
                g_userNick = data.Nick;
                if (!!data.Pic) {
                    g_userPic = data.Pic;
                }
				setBaseFontSize(document.querySelector('body'));
                g_prevFontSize = data.Font;
				switchLanguageContent(data.Lang);
				if (data.Font > 0) {
					updateFontSizeOfPage(document.querySelector('body'), data.Font);
				}
                g_state = {pageToDisplay : '.homepage-game'};
				window.history.pushState(g_state, null, "");
                refreshLoop();
                init_session_socket();
            }).catch (error => {
                reset_global();
                g_state.pageToDisplay = '.homepage-id';
                throw custom_error(response)
			});
}

async function reset_global() {
    g_userId = null;
    g_userNick = null;
    g_userPic = '/assets/general/pong.png';
    g_prevFontSize = 0;
    g_canvasHeight = 0;
    g_state = {pageToDisplay: '.homepage-id'};
    if (!!g_sessionSocket) {
        g_sessionSocket.close();
        g_sessionSocket = null;
    }
    if (!!g_refreshInterval) {
        clearInterval(g_refreshInterval);
        g_refreshInterval = null;
    }
	g_gameInviteTimer = null;
}

async function determine_state() {
    content = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

    try {
        response = await fetch('/petrus/auth/JWT-refresh/', content);
        if (response.ok) {
            await assign_global();
        }
    } catch {
    }
    await render();
}

async function render() {
	if (g_userId == null
		&& g_state.pageToDisplay != '.homepage-id'
		&& g_state.pageToDisplay != '.sign-in'
		&& g_state.pageToDisplay != '.sign-up') {
		return ;
	}

	var	pageToDisplay = document.querySelector(g_state.pageToDisplay);
	pageToDisplay.classList.remove('visually-hidden');

	var	homepageHeader = document.querySelector('.homepage-header');
	var	homepagePicture = document.querySelector('.homepage-game-picture');

	if (g_state.pageToDisplay == '.homepage-id') {
		document.querySelector('.homepage-id-input').focus();
	}
	if (g_state.pageToDisplay == '.homepage-game') {
		await clearHomepageContent();
		await setHomepageContent();
	}
	if (g_state.pageToDisplay != '.homepage-id'
		&& g_state.pageToDisplay != '.sign-in'
		&& g_state.pageToDisplay != '.sign-up'
		&& g_state.pageToDisplay != '.game'
		&& g_state.pageToDisplay != '.victory-defeat') {
		clearHomepageHeader();
		await loadHomepageHeader();

		homepageHeader.classList.remove('visually-hidden');
		homepagePicture.classList.remove('visually-hidden');
	}
	else {
		homepageHeader.classList.add('visually-hidden');
		homepagePicture.classList.add('visually-hidden');
	}

	setAriaHidden();
}

window.addEventListener('popstate', function (event) {
	if (g_userId == null) {
		g_state.pageToDisplay = '.homepage-id';
		window.history.pushState(g_state, null, "");
		return ;
	}

	var	pageToHide = document.querySelector(g_state.pageToDisplay);

	if (g_state.pageToDisplay == '.game') {
		g_gameSocket.close();
	}
	else if (g_state.pageToDisplay != '.homepage-id'
		&& g_state.pageToDisplay != '.sign-in'
		&& g_state.pageToDisplay != '.sign-up') {
		g_state = event.state;
		if (g_state.pageToDisplay == '.homepage-id'
			|| g_state.pageToDisplay == '.sign-in'
			|| g_state.pageToDisplay == '.sign-up') {
			g_state.pageToDisplay = '.homepage-game';
			window.history.pushState(g_state, null, "");
			pageToHide.classList.add('visually-hidden');
			switchNextLanguageFromPreviousSelector(g_state.pageToDisplay, event.state.pageToDisplay);
			switchNextFontSizeFromPreviousSelector(g_state.pageToDisplay, event.state.pageToDisplay);
			render(g_state);
			return ;
		}
	}
	else if (event.state) {
		g_state = event.state;
	}

	if (g_state.pageToDisplay == '.sign-in') {
		g_state.pageToDisplay = '.homepage-id';
		window.history.pushState(g_state, null, "");
	}

	pageToHide.classList.add('visually-hidden');
	switchNextLanguageFromPreviousSelector(g_state.pageToDisplay, event.state.pageToDisplay);
	switchNextFontSizeFromPreviousSelector(g_state.pageToDisplay, event.state.pageToDisplay);
	render(g_state);
});

function applyAriaHidden(element) {
	element.setAttribute('aria-hidden', 'true');
	element.style.visibility = 'hidden';

	Array.from(element.children).forEach(child => {
		applyAriaHidden(child);
	});
}

function setAriaHidden() {
	document.querySelectorAll('.visually-hidden').forEach(function(item) {
		applyAriaHidden(item);
	});
	document.querySelectorAll('[aria-hidden="true"]').forEach(function(item) {
		if (!item.classList.contains('visually-hidden') && !item.closest('.visually-hidden')) {
			item.removeAttribute('aria-hidden');
			item.style.visibility = 'visible';
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
	var	prevSelector;
	if (next == '.homepage-game') {
		prevSelector = document.querySelector('.homepage-header-language-selector');
	}
	else {
		prevSelector = document.querySelector(previous + '-language-selector');
	}

	if (prevSelector !== null) {
		var	nextSelector;
		if (next == '.homepage-game') {
			nextSelector = document.querySelector('.homepage-header-language-selector');
		}
		else {
			nextSelector = document.querySelector(next + '-language-selector');
		}
		if (nextSelector == null) {
			return ;
		}

		setLanguageSelector(prevSelector, nextSelector);
	}
}

// Set all language selectors to be like the header one.

function setLanguageSelector(prevSelector, nextSelector) {
	var	prevSelectorImg = prevSelector.firstElementChild.firstElementChild;
	var	locale = prevSelectorImg.getAttribute('alt');

	var	nextSelectorImg = nextSelector.firstElementChild.firstElementChild;

	if (nextSelectorImg.getAttribute('alt') !== locale) {
		var	nextSelectorImgSrc = nextSelectorImg.getAttribute('src');
		var	nextSelectorImgAlt = nextSelectorImg.getAttribute('alt');
		var	nextSelectorButtons = nextSelector.querySelectorAll('ul li a img');

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

function setAllLanguageSelectors() {
	var	languageSelector = document.querySelector('.homepage-header-language-selector');
	var	lang = languageSelector.querySelector('button img').alt;

	document.querySelectorAll('.language-selector').forEach(function(item) {
		if (item != languageSelector) {
			setLanguageSelector(languageSelector, item);
		}
	});

	switchLanguageAttr(lang, 'placeholder');
	switchLanguageContent(lang);
}

// Language selector : updates the page language / updates the selector images.

document.querySelectorAll('.language-selector-dropdown').forEach(function(item) {
	item.addEventListener('click', async function(event) {
		event.preventDefault();

		var	activeImg = this.parentNode;
		while (!activeImg.classList.contains('language-selector'))
			activeImg = activeImg.parentNode;
		activeImg = activeImg.firstElementChild.firstElementChild;
		var	activeImgSrc = activeImg.src;
		var	activeLang = activeImg.alt;
		var	selectedImg = this.firstElementChild;
		var	selectedLang = selectedImg.getAttribute('alt');
		try {
			// change lang of user in db
			if (item.closest('.language-selector').classList.contains('homepage-header-language-selector')) {
				await patch_user_info(g_userId, selectedLang, null, null, null, null);
			}
		} catch (error) {
			console.error(error);
			return ;
		}

		switchLanguageAttr(selectedLang, 'placeholder');
		switchLanguageContent(selectedLang);
		activeImg.setAttribute('src', selectedImg.getAttribute('src'));
		activeImg.setAttribute('alt', selectedLang);
		selectedImg.setAttribute('src', activeImgSrc);
		selectedImg.setAttribute('alt', activeLang);

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
		if (element != null) {
			element.setAttribute('data-language', 'nickname-invalid-char');
		}
		return false;
	}
	else if (nickname.length < 3) {
		if (element != null) {
			element.setAttribute('data-language', 'nickname-too-short');
		}
		return false;
	}
	else if (nickname.length > 10) {
		if (element != null) {
			element.setAttribute('data-language', 'nickname-too-long');
		}
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
	else if (name.length > 12) {
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

var	fontTimer = null;

document.querySelectorAll('.font-size-input').forEach(function(item) {
	item.addEventListener('input', async function () {
		var	newSize = this.value;

		clearTimeout(fontTimer);

		updateFontSizeOfPage(document.querySelector('body'), newSize - g_prevFontSize);
		g_prevFontSize = newSize;

		fontTimer = setTimeout(async () => {
			try {
				if (item.classList.contains('accessibility-font-size')) {
					await patch_user_info(g_userId, null, newSize, null, null, null);
				}
			} catch (error) {
				console.error(error);
			}
		}, 1500);

	});
});

function setBaseFontSize(element) {
	var	computedStyle = window.getComputedStyle(element);
	var	elementFontSize = computedStyle.fontSize;
	if (elementFontSize !== '' && parseFloat(elementFontSize) > 0) {
		element.setAttribute('base-font-size', elementFontSize);
	}

	for (let child of element.children) {
		setBaseFontSize(child);
	}
}

function updateFontSize(element, difference) {
	var computedStyle = window.getComputedStyle(element);
	var fontSizeInPx = parseFloat(computedStyle.fontSize);
	var fontSizeInPt = fontSizeInPx * (72 / 96);
	if (element.classList.contains('homepage-game-content-stats-card-context')) {
		fontSizeInPt += 1 * difference;
	}
	else {
		fontSizeInPt += 2 * difference;
	}
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

function resetFontSizeOfPage(element) {
	var	elementBaseFontSize = element.getAttribute('base-font-size');
	if (elementBaseFontSize != null) {
		element.style.fontSize = elementBaseFontSize;
	}

	for (let child of element.children) {
		resetFontSizeOfPage(child);
	}
}

function switchNextFontSizeFromPreviousSelector(previous, next) {
	var	prevFontSizeInput = document.querySelector(previous + '-font-size');

	if (prevFontSizeInput !== null) {
		var	nextFontSizeInput;
		if (next == '.homepage-game') {
			nextFontSizeInput = document.querySelector('.accessibility-font-size');
		}
		else {
			nextFontSizeInput = document.querySelector(next + '-font-size');
		}
		if (nextFontSizeInput == null) {
			return ;
		}

		nextFontSizeInput.value = prevFontSizeInput.value;
	}
}

// update homepage content

function clearHomepageContent() {
	clearHomepageFriends();

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

	var	userInfo;
	var	locale = document.querySelector('.homepage-header-language-selector button img').getAttribute('alt');

	try {
		userInfo = await get_personal_info();

		// change lang if needed
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
		}
		switchLanguageAttr(userInfo.Lang, 'placeholder');
		switchLanguageContent(userInfo.Lang);

		// change font if needed
		if (userInfo.Font != g_prevFontSize) {
			updateFontSizeOfPage(document.querySelector('body'), userInfo.Font - g_prevFontSize);
			g_prevFontSize = userInfo.Font;
		}
		document.querySelector('.accessibility-font-size').value = userInfo.Font;

		// change contrast mode if needed
		if (userInfo["Contrast-mode"] == true) {
			addContrastMode();
			document.querySelector('.accessibility .switch input').checked = true;
		}

		// change pic if needed
		if (userInfo.Pic != null) {
			document.querySelector('.homepage-header-profile img').setAttribute('src', userInfo.Pic);
			g_userPic = userInfo.Pic;
		}
		else {
			g_userPic = '/assets/general/pong.png';
			document.querySelector('.homepage-header-profile img').setAttribute('src', g_userPic);
		}

	} catch (error) {
		console.error(error);
	}

	// show friends

	await loadHomepageFriends();

	// History and stats

	var	history;

	try {

		history = await get_game_history(g_userId);
		history = await history.History;
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
					<div class="homepage-game-content-history-card-result unselectable">` + score + `</div>
					<div class="homepage-game-content-history-card-event unselectable">vs<b> ` + opponent + `</b></div>
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
					<div class="homepage-game-content-history-card-result unselectable">` + score + `</div>
					<div class="homepage-game-content-history-card-event unselectable">vs<b> ` + opponent + `</b></div>
				</div>`);

				totalPoints += history[i]["Winner-score"];
			}
			totalTime += history[i].Duration;
		}

		// Adapt new content cards to font size
		document.querySelectorAll('.homepage-history-content-card-container .content-card').forEach(function(item) {
			setBaseFontSize(item);
			updateFontSizeOfPage(item, g_prevFontSize);
		});

		if (history.length == 0) {
			document.querySelectorAll('.homepage-game-content-empty-history').forEach(function(item) {
				item.classList.remove('visually-hidden');
			});
			return ;
		}

	} catch (error) {
		console.error(error);
		document.querySelectorAll('.homepage-history-content-card-container .content-card').forEach(function(item) {
			item.parentElement.removeChild(item);
		});
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
		<div class="homepage-game-content-stats-card-stat unselectable">` + Math.round((numWins / history.length + Number.EPSILON) * 100) + `%</div>
		<div class="homepage-game-content-stats-card-context unselectable" data-language="winrate">Win rate</div>
	</div>`);

	// Average conceded points
	statsContainer.insertAdjacentHTML('beforeend', `\
	<div class="content-card w-100 d-flex justify-content-between align-items-center purple-shadow">
		<div class="homepage-game-content-stats-card-stat unselectable">` + Math.round((totalPoints / history.length + Number.EPSILON) * 100) / 100 + `</div>
		<div class="homepage-game-content-stats-card-context unselectable" data-language="points-conceded">Average conceded points</div>
	</div>`);

	var	averageTime;
	var	averageMinutes;
	var	averageSeconds;

	averageTime = Math.round(totalTime / history.length);
	averageMinutes = Math.floor(averageTime / 60);
	averageSeconds = averageTime % 60;
	if (averageSeconds < 10) {
		averageSeconds = averageSeconds.toString().padStart(2, '0');
	}

	// Average match duration
	statsContainer.insertAdjacentHTML('beforeend', `\
	<div class="content-card w-100 d-flex justify-content-between align-items-center purple-shadow">
		<div class="homepage-game-content-stats-card-stat unselectable">` + (averageMinutes + `:` + averageSeconds) + `</div>
		<div class="homepage-game-content-stats-card-context unselectable" data-language="match-duration">Average match duration</div>
	</div>`);

	// Adapt new content cards to font size
	document.querySelectorAll('.homepage-stats-content-card-container .content-card').forEach(function(item) {
		switchLanguageContent(locale);
		setBaseFontSize(item);
		updateFontSizeOfPage(item, g_prevFontSize);
	});
}

async function loadHomepageFriends() {
	var	friendsList;
	var	friendsOnline;

	try {

		friendsList = await get_friend(g_userId);
		friendsList = friendsList.Friends;

		friendsOnline = await get_friend_list_online(g_userId);
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

		// Adapt new content cards to font size
		document.querySelectorAll('.homepage-friend-content-card-container .content-card').forEach(function(item) {
			setBaseFontSize(item);
			updateFontSizeOfPage(item, g_prevFontSize);
		});

		if (friendsList.length == 0 || numOfFriendsOnline == 0) {
			document.querySelector('.homepage-game-content-no-friends').classList.remove('visually-hidden');
		}

	} catch (error) {
		document.querySelector('.homepage-game-content-no-friends').classList.remove('visually-hidden');
	}

    // Load friends profile
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
}

function clearHomepageFriends() {
	document.querySelectorAll('.homepage-friend-content-card-container .content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});
	document.querySelector('.homepage-game-content-no-friends').classList.add('visually-hidden');
}

async function goToHomepageGame(previous) {
	// hide previous and display homepage content
	var prevPage = document.querySelector(previous);
	prevPage.classList.add('visually-hidden');

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
		if (item.classList.contains('reconnection-alert')
			|| item.classList.contains('broken-socket-alert')) {
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
	// When hiding tournament info, check if we should close the tournament socket for user or not
	if (g_state.pageToDisplay == '.tournament-info') {
		checkCloseTournamentSocket();
	}
	// Leave tournament info edit mode
	if (!document.querySelector('.tournament-info-name-input-container').classList.contains('visually-hidden')) {
		leaveTournamentEditMode();
	}
	document.querySelector('.user-profile').classList.add('visually-hidden');
	document.querySelector('.victory-defeat').classList.add('visually-hidden');
	document.querySelector('.create-tournament').classList.add('visually-hidden');
	// Automatically cancel tournament creation if there was one
	resetTournamentCreation();
	document.querySelector('.accessibility').classList.add('visually-hidden');
}

function hideEveryNotif() {
	document.querySelectorAll('.notif').forEach(function(item) {
		item.classList.add('visually-hidden');
	});
	setAriaHidden();
}

//

async function checkCloseTournamentSocket() {
	var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');
	var	inTournament;
	var	inATournament;

	if (tournamentId == null || g_tournamentSocket == null) {
		return ;
	}
	try {
		inTournament = await is_participating_in_tournament(tournamentId);
		inTournament = inTournament.IsParticipating;
		inATournament = await is_in_a_tournament();
		inATournament = inATournament.inATournament;
	} catch (error) {
		console.error(error);
		return ;
	}

	if (!inTournament && !inATournament) {
		g_tournamentSocket.close();
	}
}

//

function clearHomepageId() {
	document.querySelector('.homepage-header').classList.add('visually-hidden');
	document.querySelector('.homepage-game-picture').classList.add('visually-hidden');

	resetFontSizeOfPage(document.querySelector('body'));
	setAllLanguageSelectors();
	
	var	accessibilityCheck = document.querySelector('.accessibility .switch input');
	if (accessibilityCheck.checked == true) {
		accessibilityCheck.checked = false;
		removeContrastMode();
	}

	document.querySelector('.homepage-id-input').value = '';
	document.querySelector('.sign-in-input').value = '';
	document.querySelector('.sign-up-nickname-input').value = '';
	document.querySelector('.sign-up-email-input').value = '';
	document.querySelector('.sign-up-password-input').value = '';
	document.querySelector('.sign-up-password-input-box').classList.add('visually-hidden');
	document.querySelector('.sign-up-password-confirm-input').value = '';
	document.querySelector('.sign-up-password-confirm-input-box').classList.add('visually-hidden');
	document.querySelector('.homepage-id-font-size').value = 0;
	document.querySelector('.sign-in-font-size').value = 0;
	document.querySelector('.sign-up-font-size').value = 0;
}

// 

// Close alert
document.querySelector('.game-already-alert .alert-confirm-button').addEventListener('click', function() {
	document.querySelector('.game-already-alert').classList.add('visually-hidden');
	setAriaHidden();
});
