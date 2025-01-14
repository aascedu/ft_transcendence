// Contrast mode

document.querySelector('.accessibility .switch input').addEventListener('change', async function() {
	try {
		if (this.checked) {
			await patch_user_info(g_userId, null, null, null, null, true);
		}
		else {
			await patch_user_info(g_userId, null, null, null, null, false);
		}
	} catch (error) {
		this.checked = !this.checked;
		console.error(error);
		return ;
	}
	toggleContrastMode();
});

function toggleContrastMode() {
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

function removeContrastMode() {
	document.querySelectorAll('.category').forEach(function(item) {
		item.classList.remove('category-contrast');
	});
	document.querySelectorAll('.category-icon').forEach(function(item) {
		item.classList.remove('category-icon-contrast');
	});
	document.querySelectorAll('.content-card').forEach(function(item) {
		item.classList.remove('content-card-contrast');
	});
	document.querySelectorAll('.user-profile-picture').forEach(function(item) {
		item.classList.remove('user-profile-picture-contrast');
	});
	document.querySelectorAll('.bracket-player').forEach(function(item) {
		item.classList.remove('bracket-player-contrast');
	});
	document.querySelectorAll('.homepage-header-category').forEach(function(item) {
		item.classList.remove('homepage-header-category-contrast');
	});
	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		item.classList.remove('homepage-header-open-menu-contrast');
	});
	document.querySelectorAll('.create-tournament-invite-container').forEach(function(item) {
		item.classList.remove('create-tournament-invite-container-contrast');
	});
	document.querySelectorAll('.notif').forEach(function(item) {
		item.classList.remove('notif-contrast');
	});
	document.querySelectorAll('.ball').forEach(function(item) {
		item.classList.remove('ball-contrast');
	});
}

function addContrastMode() {
	document.querySelectorAll('.category').forEach(function(item) {
		item.classList.add('category-contrast');
	});
	document.querySelectorAll('.category-icon').forEach(function(item) {
		item.classList.add('category-icon-contrast');
	});
	document.querySelectorAll('.content-card').forEach(function(item) {
		item.classList.add('content-card-contrast');
	});
	document.querySelectorAll('.user-profile-picture').forEach(function(item) {
		item.classList.add('user-profile-picture-contrast');
	});
	document.querySelectorAll('.bracket-player').forEach(function(item) {
		item.classList.add('bracket-player-contrast');
	});
	document.querySelectorAll('.homepage-header-category').forEach(function(item) {
		item.classList.add('homepage-header-category-contrast');
	});
	document.querySelectorAll('.homepage-header-open-menu').forEach(function(item) {
		item.classList.add('homepage-header-open-menu-contrast');
	});
	document.querySelectorAll('.create-tournament-invite-container').forEach(function(item) {
		item.classList.add('create-tournament-invite-container-contrast');
	});
	document.querySelectorAll('.notif').forEach(function(item) {
		item.classList.add('notif-contrast');
	});
	document.querySelectorAll('.ball').forEach(function(item) {
		item.classList.add('ball-contrast');
	});
}

// Keyboard navigation

document.querySelector('.switch').addEventListener('keypress', function(e) {
	if (e.key === 'Enter') {
		this.querySelector('input').checked = !this.querySelector('input').checked;
		toggleContrastMode();
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