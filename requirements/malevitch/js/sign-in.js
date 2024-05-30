// Input box password filling.

document.querySelector('.sign-in-input').addEventListener('input', function() {
	var	container = this.closest('.sign-in-input-container');
	var	warning = document.querySelector('.sign-in-input-warning');

	if (this.value.length > 0) {
		container.classList.add('input-container-focused');
		warning.classList.add('visually-hidden');
		setAriaHidden();
	}
	else {
		container.classList.remove('input-container-focused');
	}
});

// Submit password using Enter key.

document.querySelector('.sign-in-input').addEventListener('keypress', function(event) {
	if (event.key === 'Enter' && this.value.length > 0) {
		var	warning = document.querySelector('.sign-in-input-warning');
		var	locale = document.querySelector('.sign-in-language-selector button img').alt;
		var	nickname = document.querySelector('.sign-in-message b').textContent;
		nickname = nickname.trim();

		submitPassword(this, warning, locale, nickname, false);
	}
});

// Submit password using button.

document.querySelector('.sign-in-submit').addEventListener('click', function() {
	var	input = document.querySelector('.sign-in-input');
	var	warning = document.querySelector('.sign-in-input-warning');
	var	locale = document.querySelector('.sign-in-language-selector button img').alt;
	var	nickname = document.querySelector('.sign-in-message b').textContent;
	nickname = nickname.trim();

	submitPassword(input, warning, locale, nickname, false);
});

// RECONNECTION ALERT

// Submit password using Enter key.

document.querySelector('.reconnection-input').addEventListener('keypress', function(event) {
	if (event.key === 'Enter' && this.value.length > 0) {
		var	warning = document.querySelector('.reconnection-input-warning');
		var	locale = document.querySelector('.homepage-header-language-selector button img').alt;

		submitPassword(this, warning, locale, g_userNick, true);
	}
});

// Submit password using button.

document.querySelector('.reconnection-alert .alert-confirm-button').addEventListener('click', function() {
	var	input = document.querySelector('.sign-in-input');
	var	warning = document.querySelector('.reconnection-input-warning');
	var	locale = document.querySelector('.homepage-header-language-selector button img').alt;

	if (input.value.length > 0) {
		submitPassword(input, warning, locale, g_userNick, true);
	}
});

// Submit password to database.

async function submitPassword(input, warning, locale, nickname, isAlert) {
	try {
		const response = await fetch('/petrus/auth/signin/' + nickname, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({Id: g_userId, Pass: input.value,}),
		});

		const result = await response.json();
		if ('Err' in result && result.Err == 'Forbiden : invalid password') {
			sendInvalidPassword(input, warning, locale);
		}
		else if ('Err' in result) {
			console.error(result.Err);
		}
		else {
			console.log('Success sign-in : ' + result); // Remove after test (ELK).
            g_refreshTokenName = 'refreshToken' + g_userId;
            g_jwtName = 'JWT' + g_userId;
            sessionStorage.setItem(g_jwtName, result.Auth);
            sessionStorage.setItem(g_refreshTokenName, result.Ref);
            refreshLoop()
			if (isAlert) {
				input.value = '';
				document.querySelector('.reconnection-alert').classList.add('visually-hidden');
				setAriaHidden();
			}
			else {
				goToHomepageGame('.sign-in');
			}
		}
	}
	catch (error) {
		console.error("Error:", error);
	}
}

// Send warning if password is invalid.

function sendInvalidPassword(input, warning, locale) {
	switchLanguageContent(locale);
	warning.classList.remove('visually-hidden');
	setAriaHidden();
	input.value = '';
}

// "Sign in with another nickname" button.

document.querySelector('.sign-in-other-nickname button').addEventListener('click', function () {
	// Switch page and go back to homepage-id.
	document.querySelector('.sign-in').classList.add('visually-hidden');
	document.querySelector('.homepage-id').classList.remove('visually-hidden');
	switchNextFontSizeFromPreviousSelector('.sign-in', '.homepage-id');
	switchNextLanguageFromPreviousSelector('.sign-in', '.homepage-id');
	// Clear the homepage-id-input
	document.querySelector('.homepage-id-input').value = '';
	// Erase the old nickname in sign-in-message.
	var	newContent = document.querySelector('.sign-in-message').innerHTML.split('<b')[0];
	document.querySelector('.sign-in-message').innerHTML = newContent;
	// Clear the password input in sign-in screen
	document.querySelector('.sign-in-input').value = '';
	setAriaHidden();
});

// keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.sign-in').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;

		if (e.key === 'Tab' && document.querySelector('.sign-in-font-size') === document.activeElement) {
			if (isFw) {
				document.querySelector('.sign-in-language-selector button').focus();
			}
			else {
				document.querySelector('.sign-in-other-nickname button').focus();
			}

			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.querySelector('.sign-in-language-selector button') === document.activeElement) {
			document.querySelector('.sign-in-font-size').focus();
			e.preventDefault();
		}
	}
});
