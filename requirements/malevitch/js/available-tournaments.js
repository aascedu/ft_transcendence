// Load available tournaments from db

async function loadAvailableTournaments() {
	// var	availableTournaments = get tournament list from db
	
	// // If no tournament at all
	// if (availableTournaments.length == 0) {
		document.querySelector('.available-tournaments-card-container').classList.add('visually-hidden');
		document.querySelector('.available-tournaments-empty').classList.remove('visually-hidden');
		return ;
	// }
	
	// document.querySelector('.available-tournaments-card-container').classList.remove('visually-hidden');
	// document.querySelector('.available-tournaments-empty').classList.add('visually-hidden');

	// var	availableTournamentsContainer = document.querySelector('.available-tournaments-card-container');
	// var	tournamentName;
	// var	tournamentId;

	// for (i = 0; i < availableTournaments.length; i++) {
	// 	tournamentName = availableTournaments[i].Name;
	// 	tournamentId = availableTournaments[i].Id;
	// 	availableTournamentsContainer.insertAdjacentHTML('beforeend', `\
	// 	<button class="content-card d-flex justify-content-center align-items-center purple-shadow" tournament-id="` + tournamentId + `">
	// 		<div class="available-tournaments-card-picture position-absolute">
	// 			<img src="assets/general/trophy.svg" alt="trophy icon" draggable="false" (dragstart)="false;" class="unselectable">
	// 		</div>
	// 		<div class="available-tournaments-card-name d-flex justify-content-center align-items-center text-center unselectable">` + tournamentName + `</div>
	// 	</button>`);
	// }
}

// Hide when clicking top left button

document.querySelector('.available-tournaments-icon').addEventListener('click', function() {
	document.querySelector('.available-tournaments').classList.add('visually-hidden');
	document.querySelector('.homepage-header-logo').focus();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load tournament page when clicking on a tournament

document.querySelectorAll('.available-tournaments-card-container .content-card').forEach(function(item) {
	item.addEventListener('click', async function () {
		await loadOngoingTournament();

		document.querySelector('.tournament-info-icon').focus();

		hideEveryPage();

		g_state.pageToDisplay = '.tournament-info';
		window.history.pushState(g_state, null, "");
		render(g_state);
	});
});

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.available-tournaments').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;
		var	noTournamentAtAll = document.querySelector('.available-tournaments-empty');
		var	lastTournamentCard = document.querySelector('.available-tournaments-card-container').lastElementChild.lastElementChild;
	
		// If no tournament at all
		if (e.key === 'Tab' && !noTournamentAtAll.classList.contains('visually-hidden')) {
			document.querySelector('.available-tournaments-icon').focus();
			e.preventDefault();
		}
		// Loop after last tournament card
		if (e.key === 'Tab' && isFw && document.activeElement === lastTournamentCard) {
			document.querySelector('.available-tournaments-icon').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.activeElement === document.querySelector('.available-tournaments-icon')) {
			lastTournamentCard.focus();
			e.preventDefault();
		}
	}
});