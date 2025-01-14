// Load screen

function victoryDefeatScreen(data) {
	// Hide game and reset scores
	document.querySelector('.game').classList.add('visually-hidden');
	document.querySelectorAll('.game .score').forEach(function(item) {
		item.textContent = '0';
	});

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

	// Show screen
	document.querySelector('.victory-defeat-home').focus();

	hideEveryPage();

	g_state.pageToDisplay = '.victory-defeat';
	window.history.pushState(g_state, null, "");
	render(g_state);
}

// Click on "See tournament" button

document.querySelector('.victory-defeat-tournament').addEventListener('click', async function() {
	document.querySelector('.victory-defeat-tournament').disabled = true;
	
	// Go to my tournaments
	clearMyTournaments();
	await loadMyTournaments();

	document.querySelector('.my-tournaments-icon').focus();

	setTimeout(() => {
		document.querySelector('.victory-defeat-tournament').disabled = false;
	}, 500);
	
	hideEveryPage();

	// Load back header and video
	var	homepageHeader = document.querySelector('.homepage-header');
	var	homepagePicture = document.querySelector('.homepage-game-picture');
	homepageHeader.classList.remove('visually-hidden');
	homepagePicture.classList.remove('visually-hidden');

	g_state.pageToDisplay = '.my-tournaments';
	window.history.pushState(g_state, null, "");
	render(g_state);
});

// Click on "Play again" button

document.querySelector('.victory-defeat-again').addEventListener('click', async function() {
	try {
		document.querySelector('.victory-defeat-again').disabled = true;

		setTimeout(() => {
			document.querySelector('.victory-defeat-again').disabled = false;
		}, 500);

		var	userId = this.getAttribute('user-id');
		await invite_friend_to_game(userId);

		var	userNick = await get_user_info(userId);
		userNick = userNick.Nick;
		

		if (g_invited == true) {
			g_invited = false;
			return ;
		}

		// Display homepage game
		document.querySelector('.homepage-header-logo').focus();
		
		hideEveryPage();
	
		g_state.pageToDisplay = '.homepage-game';
		window.history.pushState(g_state, null, "");
		render(g_state);

		// show notif 3 seconds to confirm invite
		inviteSentNotif(userNick);
	} catch (error) {
		var errMsg = await error;
		if (errMsg.toString().includes('Conflict') || errMsg.toString().includes('Bad Request')) {

			// Show tournament full alert
			document.querySelector('.not-available-alert').classList.remove('visually-hidden');

			setAriaHidden();
		}
		return ;
	}
});

// Click on home button : go home

document.querySelector('.victory-defeat-home').addEventListener('click', function() {
	// Display homepage game
	document.querySelector('.homepage-header-logo').focus();

	hideEveryPage();

	g_state.pageToDisplay = '.homepage-game';
	window.history.pushState(g_state, null, "");
	render(g_state);
});