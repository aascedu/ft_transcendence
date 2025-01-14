// Pre-fill input with nickname.

function getSignUpNickname(nickname) {
	var signUpNicknameInput = document.querySelector('.sign-up-nickname-input-box');

	signUpNicknameInput.querySelector('label').textContent = nickname;
	signUpNicknameInput.querySelector('input').value = nickname;
}

// ---

async function warnUnavailableUserInfo(userInfo, infoType, element) {
	if (userInfo.includes('/')) {
		return false;
	}
	return await get_info_from_nick(userInfo)
	.then (data => {
		if (!data.Ava) {
			element.setAttribute('data-language', infoType + '-taken');
		}
		return data.Ava;
	})
	.catch (error => {
		console.error('Fetch problem:', error.message);
	});
}

// Email checking functions

function warnInvalidEmail(email, element) {
	var	emailBackup = email;
	const regex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
	var result = regex.test(String(email).toLowerCase());
	if (!result) {
		element.setAttribute('data-language', 'invalid-email');
		return result;
	}
	var emailUser = email.split('@')[0];
	var	firstChar = emailUser[0];
	var	lastChar = emailUser[emailUser.length - 1];

	const forbiddenFirstLast = /[.-]/;

	result = forbiddenFirstLast.test(firstChar);
	if (result) {
		element.setAttribute('data-language', 'invalid-email');
		return false;
	}

	if (lastChar == '.') {
		element.setAttribute('data-language', 'invalid-email');
		return false;
	}

	if (emailUser.includes('..') || emailUser.includes('--')) {
		element.setAttribute('data-language', 'invalid-email');
		return false;
	}

	return true;
}

// Password checking functions

function containsLetters(str) {
	var letters = /[a-zA-Z]/i;
	return letters.test(str);
}

function containsLowercase(str) {
	return /[a-z]/.test(str);
}

function containsUppercase(str) {
	return /[A-Z]/.test(str);
}

function containsNumbers(str) {
	return /\d/.test(str);
}

function containsSymbols(str) {
	const symbols = /[!@#$%^&*(),.?":{}|<>+=\-_]/;
	return symbols.test(str);
   }

function warnInvalidPassword(password, element) {
	if (!containsLetters(password)) {
		element.setAttribute('data-language', 'password-letter');
		return false;
	}
	else if (!containsLowercase(password)) {
		element.setAttribute('data-language', 'password-lowercase');
		return false;
	}
	else if (!containsUppercase(password)) {
		element.setAttribute('data-language', 'password-uppercase');
		return false;
	}
	else if (!containsNumbers(password)) {
		element.setAttribute('data-language', 'password-number');
		return false;
	}
	else if (!containsSymbols(password)) {
		element.setAttribute('data-language', 'password-symbol');
		return false;
	}
	else if (password.length < 8) {
		element.setAttribute('data-language', 'password-too-short');
		return false;
	}
	return true;
}

// Checking password confirmation

function warnDifferentPasswords(pass1, pass2, element) {
	if (pass1 != pass2) {
		element.setAttribute('data-language', 'different-passwords');
		return false;
	}
	return true;
}

// Input box nickname filling.

document.querySelector('.sign-up-nickname-input').addEventListener('input', function() {
	signUpNickname(this);
});

async function signUpNickname(input) {
	var	warning = document.querySelector('.sign-up-nickname-input-warning');
	var	locale = document.querySelector('.sign-up-language-selector button img').alt;

	if (input.value.length > 0) {
		// Make the following inputs appear only when the choosen nickname is valid.
		// Warn and block invalid characters, or nicknames too short or too long.
		try {
			const nickAvailability = await warnUnavailableUserInfo(input.value, 'nickname', warning);
			if (!warnInvalidNickname(input.value, warning) || !nickAvailability) {
				switchLanguageContent(locale);
				warning.classList.remove('visually-hidden');
				document.querySelector('.sign-up-email-input-box').classList.add('visually-hidden');
				document.querySelector('.sign-up-email-input-warning').classList.add('visually-hidden');
				document.querySelector('.sign-up-password-input-box').classList.add('visually-hidden');
				document.querySelector('.sign-up-password-input-warning').classList.add('visually-hidden');
				document.querySelector('.sign-up-password-confirm-input-box').classList.add('visually-hidden');
				document.querySelector('.sign-up-password-confirm-input-warning').classList.add('visually-hidden');
			}
			else {
				warning.classList.add('visually-hidden');
				document.querySelector('.sign-up-email-input-box').classList.remove('visually-hidden');
				signUpEmail(document.querySelector('.sign-up-email-input'));
			}
		}
		catch (error) {
			console.error('Error: ' + error);
		}
	}
	else {
		warning.classList.add('visually-hidden');
		document.querySelector('.sign-up-email-input-box').classList.add('visually-hidden');
		document.querySelector('.sign-up-password-input-box').classList.add('visually-hidden');
		document.querySelector('.sign-up-password-confirm-input-box').classList.add('visually-hidden');
	}
	setAriaHidden();
}

// Input box email filling.

document.querySelector('.sign-up-email-input').addEventListener('input', function () {
	signUpEmail(this);
});

var	emailTimer = null;

async function signUpEmail(input) {
	var	warning = document.querySelector('.sign-up-email-input-warning');
	var	locale = document.querySelector('.sign-up-language-selector button img').alt;

	clearTimeout(emailTimer);

	if (input.value.length > 0 && !input.classList.contains('visually-hidden')) {
		// Make the following inputs appear only when the choosen email is valid.
		try {
			if (!warnInvalidEmail(input.value, warning)) {
				switchLanguageContent(locale);
				warning.classList.remove('visually-hidden');
				document.querySelector('.sign-up-password-input-box').classList.add('visually-hidden');
				document.querySelector('.sign-up-password-input-warning').classList.add('visually-hidden');
				document.querySelector('.sign-up-password-confirm-input-box').classList.add('visually-hidden');
				document.querySelector('.sign-up-password-confirm-input-warning').classList.add('visually-hidden');
			}
			else {
				emailTimer = setTimeout(async () => {
					const emailAvailability = await warnUnavailableUserInfo(input.value, 'email', warning);
					if (!emailAvailability) {
						switchLanguageContent(locale);
						document.querySelector('.sign-up-email-input-warning').classList.remove('visually-hidden');
						document.querySelector('.sign-up-password-input-box').classList.add('visually-hidden');
						document.querySelector('.sign-up-password-input-warning').classList.add('visually-hidden');
						document.querySelector('.sign-up-password-confirm-input-box').classList.add('visually-hidden');
						document.querySelector('.sign-up-password-confirm-input-warning').classList.add('visually-hidden');
					}
					else {
						document.querySelector('.sign-up-email-input-warning').classList.add('visually-hidden');
						document.querySelector('.sign-up-password-input-box').classList.remove('visually-hidden');
						signUpPassword(document.querySelector('.sign-up-password-input'));
					}
					setAriaHidden();
				}, 200);
			}
		}
		catch(error) {
			console.error('Error: ' + error);
		}
	}
	else {
		warning.classList.add('visually-hidden');
		document.querySelector('.sign-up-password-input-box').classList.add('visually-hidden');
		document.querySelector('.sign-up-password-confirm-input-box').classList.add('visually-hidden');
	}
	setAriaHidden();
}

// Input box password filling.

document.querySelector('.sign-up-password-input').addEventListener('input', function() {
	signUpPassword(this);
});

function signUpPassword(input) {
	var	warning = document.querySelector('.sign-up-password-input-warning');
	var	locale = document.querySelector('.sign-up-language-selector button img').alt;

	if (input.value.length > 0 && !input.classList.contains('visually-hidden')) {
		// Make the following inputs appear only when the choosen password is valid.
		if (!warnInvalidPassword(input.value, warning)) {
			switchLanguageContent(locale);
			warning.classList.remove('visually-hidden');
			document.querySelector('.sign-up-password-confirm-input-box').classList.add('visually-hidden');
			document.querySelector('.sign-up-password-confirm-input-warning').classList.add('visually-hidden');
		}
		else {
			warning.classList.add('visually-hidden');
			document.querySelector('.sign-up-password-confirm-input-box').classList.remove('visually-hidden');
			signUpPasswordConfirm(document.querySelector('.sign-up-password-confirm-input'));
		}
	}
	else {
		warning.classList.add('visually-hidden');
		document.querySelector('.sign-up-password-confirm-input-box').classList.add('visually-hidden');
	}
	setAriaHidden();
}

// Input box password confirmation.

document.querySelector('.sign-up-password-confirm-input').addEventListener('input', function() {
	signUpPasswordConfirm(this);
});

function signUpPasswordConfirm(input) {
	var	container = input.closest('.sign-up-input-container');
	var	warning = document.querySelector('.sign-up-password-confirm-input-warning');
	var	locale = document.querySelector('.sign-up-language-selector button img').alt;
	var	passToCheck = document.querySelector('.sign-up-password-input');

	if (input.value.length > 0 && !input.classList.contains('visually-hidden')) {
		// Make the following inputs appear only when the choosen password is valid.
		if (!warnDifferentPasswords(input.value, passToCheck.value, warning)) {
			switchLanguageContent(locale);
			warning.classList.remove('visually-hidden');
			container.classList.remove('input-container-focused');
			setAriaHidden();
			return false;
		}
		else {
			warning.classList.add('visually-hidden');
			container.classList.add('input-container-focused');
			setAriaHidden();
			return true;
		}
	}
	else {
		warning.classList.add('visually-hidden');
		setAriaHidden();
		return false;
	}
}

// Submit info and create account

document.querySelectorAll('.sign-up input').forEach(function (item) {
	item.addEventListener('keypress', function (event) {
		var passwordConfirmBox = document.querySelector('.sign-up-password-confirm-input-box');
		var	passwordConfirmInput = document.querySelector('.sign-up-password-confirm-input');

		if (event.key === 'Enter' && !passwordConfirmBox.classList.contains('visually-hidden')
		&& signUpPasswordConfirm(passwordConfirmInput)) {
			submitCreateAccount();
		}
	});
});

document.querySelector('.sign-up-submit').addEventListener('click', function () {
	var passwordConfirmBox = document.querySelector('.sign-up-password-confirm-input-box');
	var	passwordConfirmInput = document.querySelector('.sign-up-password-confirm-input');

	if (!passwordConfirmBox.classList.contains('visually-hidden')
	&& signUpPasswordConfirm(passwordConfirmInput)) {
		submitCreateAccount();
	}
});

async function submitCreateAccount() {
	var	nick = document.querySelector('.sign-up-nickname-input').value;
	var	email = document.querySelector('.sign-up-email-input').value;
	var	password = document.querySelector('.sign-up-password-input').value;
	var	lang = document.querySelector('.sign-up-language-selector button img').alt;
	var	font = document.querySelector('.sign-up-font-size').value;

    signup(nick, email, password, lang, font);
}

async function patchUserContent() {
	var	email = document.querySelector('.sign-up-email-input').value;
	var	lang = document.querySelector('.sign-up-language-selector button img').alt;
	var	font = document.querySelector('.sign-up-font-size').value;

	try {
		await patch_user_info(g_userId, lang, font, g_userNick, email, null);
	} catch (error) {
		console.error(error);
		return ;
	}
}

// "I already have an account" button.

document.querySelector('.sign-up-sign-in button').addEventListener('click', function () {
	// Switch page and go back to homepage-id.
	document.querySelector('.sign-up').classList.add('visually-hidden');
	document.querySelector('.homepage-id').classList.remove('visually-hidden');
	switchNextFontSizeFromPreviousSelector('.sign-up', '.homepage-id');
	switchNextLanguageFromPreviousSelector('.sign-up', '.homepage-id');
	// Clear the homepage-id-input
	document.querySelector('.homepage-id-input').value = '';
	// Clear the inputs on previous sign up screen
	document.querySelector('.sign-up-email-input').value = '';
	document.querySelector('.sign-up-password-input').value = '';
	document.querySelector('.sign-up-password-confirm-input').value = '';
	setAriaHidden();
});

// keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.sign-up').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;

		if (e.key === 'Tab' && document.querySelector('.sign-up-font-size') === document.activeElement) {
			if (isFw) {
				document.querySelector('.sign-up-nickname-input').focus();
			}
			else {
				document.querySelector('.sign-up-sign-in button').focus();
			}

			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.querySelector('.sign-up-nickname-input') === document.activeElement) {
			document.querySelector('.sign-up-font-size').focus();
			e.preventDefault();
		}
	}
});
