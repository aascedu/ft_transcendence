// Go home when clicking the home button

document.querySelector('.victory-defeat-home').addEventListener('click', async function() {
	document.querySelector('.victory-defeat').classList.add('visually-hidden');

	document.querySelector('.homepage-game-picture').classList.remove('visually-hidden');

	await clearHomepageContent();
	await setHomepageContent();

	clearHomepageHeader();
	await loadHomepageHeader();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Go to tournament page when clicking the tournament button

document.querySelector('.victory-defeat-tournament').addEventListener('click', async function() {
	document.querySelector('.victory-defeat').classList.add('visually-hidden');

	document.querySelector('.homepage-game-picture').classList.remove('visually-hidden');

	await loadOngoingTournament();

	g_state.pageToDisplay = '.tournament-info';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Load screen

function victoryDefeatScreen(data) {
	// Display scores
	var	userScore = document.querySelector('.victory-defeat-user-score');
	var	opponentScore = document.querySelector('.victory-defeat-opponent-score');

	userScore.textContent = data.myScore;
	opponentScore.textContent = data.opponentScore;
	
	// Display correct message if win or lose
	var	victoryMessage = document.querySelector('.victory-defeat-message-victory');
	var	defeatMessage = document.querySelector('.victory-defeat-message-defeat');

	if (data.type == 'youWin') {
		victoryMessage.classList.remove('visually-hidden');
		defeatMessage.classList.add('visually-hidden');
	}
	else {
		victoryMessage.classList.add('visually-hidden');
		defeatMessage.classList.remove('visually-hidden');		
	}
	
	// Display correct button if tournament game or not
	var	playAgain = document.querySelector('.victory-defeat-again');
	var	seeTournament = document.querySelector('.victory-defeat-tournament');

	if (data.isTournament == true) {
		seeTournament.classList.remove('visually-hidden');
		playAgain.classList.add('visually-hidden');
	}
	else {
		seeTournament.classList.add('visually-hidden');
		playAgain.classList.remove('visually-hidden');
		playAgain.setAttribute('user-id', data.opponentId);
	}

	setAriaHidden();
}