// Hide when clicking top left button

document.querySelector('.accessibility-icon').addEventListener('click', function() {
	document.querySelector('.accessibility').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Contrast mode

document.querySelector('.accessibility .switch input').addEventListener('change', function() {
	contrastMode();

	if (this.checked) {
		patch_user_info(g_userId, null, null, null, null, true);
	}
	else {
		patch_user_info(g_userId, null, null, null, null, false);
	}
});

function contrastMode() {
	document.querySelectorAll('.category').forEach(function(item) {
		item.classList.toggle('category-contrast');
	});
	document.querySelectorAll('.category-icon').forEach(function(item) {
		item.classList.toggle('category-icon-contrast');
	});
	document.querySelectorAll('.content-card').forEach(function(item) {
		item.classList.toggle('content-card-contrast');
	});
	document.querySelectorAll('.user-profile-picture').forEach(function(item) {
		item.classList.toggle('user-profile-picture-contrast');
	});
	document.querySelectorAll('.bracket-player').forEach(function(item) {
		item.classList.toggle('bracket-player-contrast');
	});
	document.querySelectorAll('.homepage-header-category').forEach(function(item) {
		item.classList.toggle('homepage-header-category-contrast');
	});
	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		item.classList.toggle('homepage-header-open-menu-contrast');
	});
	document.querySelectorAll('.create-tournament-invite-container').forEach(function(item) {
		item.classList.toggle('create-tournament-invite-container-contrast');
	});
	document.querySelectorAll('.notif').forEach(function(item) {
		item.classList.toggle('notif-contrast');
	});
	document.querySelectorAll('.ball').forEach(function(item) {
		item.classList.toggle('ball-contrast');
	});
}

// Keyboard navigation

document.querySelector('.switch').addEventListener('keypress', function(e) {
	if (e.key === 'Enter') {
		this.querySelector('input').checked = !this.querySelector('input').checked;
		contrastMode();
	}
});

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.accessibility').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;
		var	lastRef = document.querySelector('.accessibility-references ul').lastElementChild.querySelector('a');

		if (e.key === 'Tab' && isFw && document.activeElement === lastRef) {
			document.querySelector('.accessibility-icon').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.activeElement === document.querySelector('.accessibility-icon')) {
			lastRef.focus();
			e.preventDefault();
		}
	}
});