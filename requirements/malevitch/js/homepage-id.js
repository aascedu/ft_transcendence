// Input box nickname filling.

document.querySelector('.homepage-id-input').addEventListener('input', function() {
	var	container = this.closest('.homepage-id-input-container');
	var	warning = document.querySelector('.homepage-id-input-warning');
	var	locale = document.querySelector('.homepage-id-language-selector button img').alt;
	
	if (this.value.length > 0) {
		// Make the submit button appear only when the choosen nickname is valid.
		// Warn and block invalid characters, or nicknames too short or too long.
		if (!warnInvalidNickname(this.value, warning)) {
			switchLanguageContent(locale);
			warning.classList.remove('visually-hidden');
			container.classList.remove('input-container-focused');
		}
		else {
			warning.classList.add('visually-hidden');
			container.classList.add('input-container-focused');
		}
	} 
	else {
		warning.classList.add('visually-hidden');
		container.classList.remove('input-container-focused');
	}
});

// Submit nickname using Enter key.

document.querySelector('.homepage-id-input').addEventListener('keypress', function(event) {
	var	warning = document.querySelector('.homepage-id-input-warning');

	if (event.key === 'Enter' && warnInvalidNickname(this.value, warning)) {
		submitNickname(this.value);
	}
});

// Submit nickname using button.

document.querySelector('.homepage-id-submit').addEventListener('click', function() {
	var	input = document.querySelector('.homepage-id-input');

	submitNickname(input.value);
});

// Submit nickname and redirect to signin or signup.

function submitNickname(nickname) {
	g_userNick = nickname;
	document.querySelector('.homepage-id').classList.add('visually-hidden');

	fetch('/petrus/auth/signin/' + nickname)
		.then (response => {
			if (!response.ok) {
				throw new Error('HTTP error: ' + response.status);
			}
			return response.json();
		})
		.then (data => {
			if (data.Ava) {
				g_state.pageToDisplay = '.sign-up';
				getSignUpNickname(nickname);
				document.querySelector('.sign-up-email-input').focus();
			}
			else {
				g_state.pageToDisplay = '.sign-in';
				g_userId = data.Id;
				document.querySelector('.sign-in-input').focus();
				addInfoToElement(nickname, document.querySelector('.sign-in-message'));
			}
			// Update language content
			switchNextLanguageFromPreviousSelector('.homepage-id', g_state.pageToDisplay);
			// Update accessibility content
			switchNextFontSizeFromPreviousSelector('.homepage-id', g_state.pageToDisplay);
			// Update history
			window.history.pushState(g_state, null, "");
			render(g_state);
		})
		.catch (error => {
			console.error('Fetch problem:', error.message);
		});
}

// keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.homepage-id').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;

		if (e.key === 'Tab' && document.querySelector('.homepage-id-font-size') === document.activeElement) {
	
			if (isFw) {
				document.querySelector('.homepage-id-language-selector button').focus();
			}
			else {
				var	submit = document.querySelector('.homepage-id-submit');
				var	submitStyle = window.getComputedStyle(submit);
				var	submitVisibility = submitStyle.getPropertyValue('visibility');
				if (submitVisibility == 'hidden') {
					document.querySelector('.homepage-id-input').focus();
				}
				else {
					document.querySelector('.homepage-id-submit').focus();
				}
			}
	
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.querySelector('.homepage-id-language-selector button') === document.activeElement) {
			document.querySelector('.homepage-id-font-size').focus();
			e.preventDefault();
		}
	}
});