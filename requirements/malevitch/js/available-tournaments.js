// Load available tournaments from db

async function loadAvailableTournaments() {
	var	availableTournaments = await get_tournaments_available();
	
	// If no tournament at all
	if (Object.entries(availableTournaments).length == 0) {
		document.querySelector('.available-tournaments-card-container').classList.add('visually-hidden');
		document.querySelector('.available-tournaments-empty').classList.remove('visually-hidden');
		return ;
	}

	var	availableTournamentsContainer = document.querySelector('.available-tournaments-card-container');
	availableTournamentsContainer = availableTournamentsContainer.firstElementChild;

	Object.entries(availableTournaments).forEach(([key, value]) => {
		availableTournamentsContainer.insertAdjacentHTML('beforeend', `\
		<button class="content-card d-flex justify-content-center align-items-center purple-shadow" tournament-id="` + key + `">
			<div class="available-tournaments-card-picture position-absolute">
				<img src="assets/general/trophy.svg" alt="trophy icon" draggable="false" (dragstart)="false;" class="unselectable">
			</div>
			<div class="available-tournaments-card-name d-flex justify-content-center align-items-center text-center unselectable">` + value + `</div>
		</button>`);
	});

	// Load tournament page when clicking on a tournament

	document.querySelectorAll('.available-tournaments-card-container .content-card').forEach(function(item) {
		item.addEventListener('click', async function () {
			await loadOngoingTournament(item.getAttribute('tournament-id'));

			document.querySelector('.tournament-info-icon').focus();

			hideEveryPage();

			g_state.pageToDisplay = '.tournament-info';
			window.history.pushState(g_state, null, "");
			render(g_state);
		});
	});
}

function clearAvailableTournaments() {
	var container = document.querySelector('.available-tournaments-card-container');
	container = container.firstElementChild;

	container.querySelectorAll('.content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});

	document.querySelector('.available-tournaments-card-container').classList.remove('visually-hidden');
	document.querySelector('.available-tournaments-empty').classList.add('visually-hidden');
}

// Hide when clicking top left button

document.querySelector('.available-tournaments-icon').addEventListener('click', function() {
	document.querySelector('.available-tournaments').classList.add('visually-hidden');
	document.querySelector('.homepage-header-logo').focus();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
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