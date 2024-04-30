// Hide when clicking top left button

document.querySelector('.accessibility-icon').addEventListener('click', function() {
	document.querySelector('.accessibility').classList.add('visually-hidden');

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Contrast mode

document.querySelector('.accessibility .switch input').addEventListener('change', function() {
	if (this.checked) {
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
	}
	else {
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
	}
});