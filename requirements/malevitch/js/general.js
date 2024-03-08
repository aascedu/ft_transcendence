// Global variables.
let g_userId;
let	g_userNick;
let	g_prevFontSize = 0;

// Translation functions.

function loadTranslations() {
	return fetch('./assets/lang/translations.json')
	  .then(response => response.json())
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
			var	info;
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

//

function addInfoToElement(info, element) {
	element.innerHTML = element.textContent + '<b>&nbsp;' + info + '&nbsp;</b>!';
}

// Password eye icons

document.querySelector('.input-box button').addEventListener('click', function() {
	togglePasswordView(this.parentNode);
});

function togglePasswordView(container) {
	var	input = container.querySelector('input');
	var	icon = container.querySelector('button img');

	if (input.getAttribute('type') == 'password') {
		input.setAttribute('type', 'text');
		icon.setAttribute('src', 'assets/general/hidden-purple.png');
	}
	else {
		input.setAttribute('type', 'password');
		icon.setAttribute('src', 'assets/general/view-purple.png');
	}
}

// Font size functions

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
	var	nextFontSizeInput = document.querySelector(next + '-font-size');

	nextFontSizeInput.value = prevFontSizeInput.value;
	
	updateFontSizeOfPage(document.querySelector(next), nextFontSizeInput.value);
}