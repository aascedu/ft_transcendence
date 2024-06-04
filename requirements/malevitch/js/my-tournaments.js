// Load my tournaments from DB

async function loadMyTournaments() {
	var	ongoingTournaments = await get_my_tournaments();
	ongoingTournaments = ongoingTournaments.Ongoing;
	var	closedTournaments = await get_tournament_history(g_userId);
	closedTournaments = closedTournaments[g_userId];
	
	// If no tournament at all
	if ((Object.entries(ongoingTournaments).length + closedTournaments.length) == 0) {
		document.querySelector('.my-tournaments-ongoing').classList.add('visually-hidden');
		document.querySelector('.my-tournaments-closed').classList.add('visually-hidden');
		document.querySelector('.my-tournaments-empty').classList.remove('visually-hidden');
		return ;
	}
	
	var	ongoingTournamentsContainer = document.querySelector('.my-tournaments-ongoing');
	var	closedTournamentsContainer = document.querySelector('.my-tournaments-closed');
	var	tournamentName;
	var	tournamentId;

	// My ongoing tournaments
	document.querySelector('.my-tournaments-no-open').classList.add('visually-hidden');

	for (i = 0; i < ongoingTournaments.length; i++) {
		tournamentName = ongoingTournaments[i].Name;
		tournamentId = ongoingTournaments[i].Id;

		ongoingTournamentsContainer.insertAdjacentHTML('beforeend', `\
		<button class="content-card d-flex justify-content-center align-items-center purple-shadow" tournament-id="` + tournamentId + `">
			<div class="my-tournaments-card-picture position-absolute">
				<img src="assets/general/trophy.svg" alt="tournament icon" draggable="false" (dragstart)="false;" class="unselectable">
			</div>
			<div class="my-tournaments-card-name d-flex justify-content-center align-items-center text-center unselectable">` + tournamentName + `</div>
		</button>`);
	}
	if (ongoingTournaments.length == 0) {
		document.querySelector('.my-tournaments-no-open').classList.remove('visually-hidden');
	}

	// Closed tournaments
	document.querySelector('.my-tournaments-closed').classList.remove('visually-hidden');
	document.querySelector('.my-tournaments-no-closed').classList.add('visually-hidden');

	for (i = 0; i < closedTournaments.length; i++) {
		tournamentName = closedTournaments[i].Name;
		tournamentId = closedTournaments[i].Id;

		closedTournamentsContainer.insertAdjacentHTML('beforeend', `\
		<button class="content-card d-flex justify-content-center align-items-center purple-shadow" tournament-id="` + tournamentId + `">
			<div class="my-tournaments-card-picture position-absolute">
				<img src="assets/general/trophy.svg" alt="tournament icon" draggable="false" (dragstart)="false;" class="unselectable">
			</div>
			<div class="my-tournaments-card-name d-flex justify-content-center align-items-center text-center unselectable">` + tournamentName + `</div>
		</button>`);
	}
	if (closedTournaments.length == 0) {
		document.querySelector('.my-tournaments-no-closed').classList.remove('visually-hidden');
	}

	// Load tournament page when clicking on a tournament

	document.querySelectorAll('.my-tournaments-ongoing .content-card').forEach(function(item) {
		item.addEventListener('click', async function () {
			var tournamentId123 = item.getAttribute('tournament-id');
			console.log(tournamentId123);
			await loadOngoingTournament(tournamentId123);


			document.querySelector('.tournament-info-icon').focus();
			
			hideEveryPage();

			g_state.pageToDisplay = '.tournament-info';
			window.history.pushState(g_state, null, "");
			render(g_state);
		});
	});

	document.querySelectorAll('.my-tournaments-closed .content-card').forEach(function(item) {
		item.addEventListener('click', async function () {
			await loadClosedTournament(item.getAttribute('tournament-id'));

			document.querySelector('.tournament-info-icon').focus();
			
			hideEveryPage();

			g_state.pageToDisplay = '.tournament-info';
			window.history.pushState(g_state, null, "");
			render(g_state);
		});
	});
}

function clearMyTournaments() {
	document.querySelector('.my-tournaments-card-container').classList.remove('visually-hidden');
	document.querySelector('.my-tournaments-ongoing').classList.remove('visually-hidden');
	document.querySelector('.my-tournaments-closed').classList.remove('visually-hidden');
	document.querySelector('.my-tournaments-empty').classList.add('visually-hidden');

	var	ongoingTournamentsContainer = document.querySelector('.my-tournaments-ongoing');
	var	closedTournamentsContainer = document.querySelector('.my-tournaments-closed');

	ongoingTournamentsContainer.querySelectorAll('.content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});

	closedTournamentsContainer.querySelectorAll('.content-card').forEach(function(item) {
		item.parentElement.removeChild(item);
	});
}

// Hide when clicking top left button

document.querySelector('.my-tournaments-icon').addEventListener('click', async function() {
	document.querySelector('.my-tournaments').classList.add('visually-hidden');
	document.querySelector('.homepage-header-logo').focus();

	clearHomepageContent();
	await setHomepageContent();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.my-tournaments').classList.contains('visually-hidden')) {
		let isFw =!e.shiftKey;
		var	noTournamentAtAll = document.querySelector('.my-tournaments-empty');
		var	noTournamentOngoing = document.querySelector('.my-tournaments-no-open');
		var	noTournamentClosed = document.querySelector('.my-tournaments-no-closed');
		var	lastTournamentCard;
	
		// If no tournament at all
		if (e.key === 'Tab' && !noTournamentAtAll.classList.contains('visually-hidden')) {
			document.querySelector('.my-tournaments-icon').focus();
			e.preventDefault();
		}
		// Determine last tournament card
		if (!noTournamentOngoing.classList.contains('visually-hidden')) {
			lastTournamentCard = document.querySelector('.my-tournaments-closed').lastElementChild;
		}
		else if (!noTournamentClosed.classList.contains('visually-hidden')) {
			lastTournamentCard = document.querySelector('.my-tournaments-ongoing').lastElementChild;
		}
		else {
			lastTournamentCard = document.querySelector('.my-tournaments-closed').lastElementChild;
		}
		// Loop after last tournament card
		if (e.key === 'Tab' && isFw && document.activeElement === lastTournamentCard) {
			document.querySelector('.my-tournaments-icon').focus();
			e.preventDefault();
		}
		if (e.key === 'Tab' && !isFw && document.activeElement === document.querySelector('.my-tournaments-icon')) {
			lastTournamentCard.focus();
			e.preventDefault();
		}
	}
});
