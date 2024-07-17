async function init_tournament_socket(tournamentId) {
	if (g_tournamentSocket) {
		return ;
	}

	try {
		const roomName = tournamentId;
		const domain = window.location.host;
		const token = await get_socket_connection_token('/coubertin/');
		const url = 'wss://' + domain + '/coubertin/tournament/ws/' + roomName + '/?token=' + token;
		g_tournamentSocket = new WebSocket(url);
	} catch (error) {
		console.error(error);
		return;
	}

    g_tournamentSocket.onopen = function() {
    }

    g_tournamentSocket.onclose = function() {
		g_tournamentSocket = null;
    }

    g_tournamentSocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.Action === "startGame") {
			// "Match found" notif
			var	opponent = data.RoomName;
			opponent = opponent.split('-');
			if (opponent[1] == g_userId) {
				opponent = opponent[2];
			}
			else {
				opponent = opponent[1];
			}
			await matchFound(opponent);

            showGamePage(data.RoomName);
			return ;
        }

		if (data.Action === 'someoneJoined' || data.Action === 'someoneInvited') {
			var tournament = data.Tournament;
			var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');
			var	joinedData = data.Data;
			var	joinedId = joinedData;
			var	noPlayerYet = document.querySelector('.tournament-info-no-players');
			
			if (data.Action === 'someoneJoined') {
				var	joinedAlias = joinedData.Alias;
                joinedId = joinedData.Id;
			}

			// If we are on a tournament page
			if (g_state.pageToDisplay == '.tournament-info') {
				clearTournamentInfoInvites();
				await loadTournamentInfoInvites();

				// If the tournament is the one that has been updated
				if (tournamentId == tournament.Id) {
					var playersContainer = document.querySelector('.tournament-info-players');
	
					try {
						var userInfo = await get_user_info(joinedId);
						var userPic = userInfo.Pic;
						if (userPic == null) {
							userPic = 'assets/general/pong.png';
						}

						// If there was no player card before, remove the 'no player yet'
						if (!noPlayerYet.classList.contains('visually-hidden')) {
							noPlayerYet.classList.add('visually-hidden');
						}
				
						if (data.Action === 'someoneJoined') {
							// Add the content card
							playersContainer.insertAdjacentHTML('beforeend', `\
							<button class="content-card d-flex justify-content-between align-items-center purple-shadow" user-id="` + joinedId + `">
							<div class="user-card-name unselectable">` + joinedAlias + `</div>
							<div class="user-card-picture">
							<img src="` + userPic + `" alt="profile picture of ` + joinedAlias + `" draggable="false" (dragstart)="false;" class="unselectable">
							</div>
							</button>`);

							// If there was a pending card for this player, remove it
							playersContainer.querySelectorAll('.invite-pending').forEach(function(item) {
								if (item.getAttribute('user-id') == joinedId) {
									item.parentElement.removeChild(item);
								}
							});

							// Update number of players
							var	numPlayersElement = document.querySelector('.tournament-info-players-num');
							var	numPlayersSplit = numPlayersElement.textContent.split('/');
							numPlayersElement.textContent = (parseInt(numPlayersSplit[0], 10) + 1) + '/' + numPlayersSplit[1];
						}
						else {
							// Add the pending card
							playersContainer.insertAdjacentHTML('beforeend', `\
							<button class="content-card invite-pending d-flex justify-content-between align-items-center purple-shadow" user-id="` + joinedId + `">
								<div class="d-flex flex-nowrap align-items-center">
									<div class="user-card-name unselectable">`+ userInfo.Nick + `</div>
									<div class="user-card-pending" data-language="pending">(pending...)</div>
								</div>
								<div class="user-card-picture">
									<img src="` + userPic + `" alt="profile picture of `+ userInfo.Nick + `" draggable="false" (dragstart)="false;" class="unselectable">
								</div>
							</button>`);
						}

                        var createdCard = playersContainer.lastElementChild;

                        setBaseFontSize(createdCard);
                        updateFontSizeOfPage(createdCard, g_prevFontSize);
	
						// Load user profile page when clicking on a player
						var thisCard = playersContainer.lastElementChild;
						thisCard.addEventListener('click', async function() {
							this.disabled = true;
							var userId = this.getAttribute('user-id');
							if (userId == null) {
								setTimeout(() => {
									userId = this.getAttribute('user-id');
								}, 500);
							}
							await loadUserProfile(userId, this);
						});
					} catch (error) {
						console.error(error);
					}
				}
			}

			// load back available friends in case a friend joined a tournament and is no longer available
			if (g_state.pageToDisplay == '.create-tournament') {
				await clearCreateTournamentAvailableFriends();
				await createTournamentLoadAvailableFriends();
			}

			// load back header in case a friend joined a tournament and is no longer available
			await clearHomepageHeader();
			await loadHomepageHeader();

			setAriaHidden();
			return ;
		}

		if (data.Action === 'someoneLeft' || data.Action === 'declineInvited') {
			var tournament = data.Tournament;
			var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');
			var	toRemove = data.Data;
			var	noPlayerYet = document.querySelector('.tournament-info-no-players');

			// If we are on a tournament page
			if (g_state.pageToDisplay == '.tournament-info') {
				clearTournamentInfoInvites();
				await loadTournamentInfoInvites();

				// If we are on the one tournament that is updated
				if (tournamentId == tournament.Id) {
					document.querySelectorAll('.tournament-info-players .content-card').forEach(function(item) {
						if (item.getAttribute('user-id') == toRemove) {
							item.parentElement.removeChild(item);

							if (data.Action === 'someoneLeft') {
								// Update number of players
								var	numPlayersElement = document.querySelector('.tournament-info-players-num');
								var	numPlayersSplit = numPlayersElement.textContent.split('/');
								var	newNumPlayers = (numPlayersSplit[0] - 1);
								numPlayersElement.textContent = newNumPlayers + '/' + numPlayersSplit[1];
		
								var	pendingInvites = document.querySelectorAll('.tournament-info-players .invite-pending');
		
								// If there are no more players and no pending invites
								if (newNumPlayers == 0 && pendingInvites.length == 0) {
									noPlayerYet.classList.remove('visually-hidden');
								}
							}
						}
					});
				}
			}

			// load back available friends in case a friend left a tournament and is now available
			if (g_state.pageToDisplay == '.create-tournament') {
				await clearCreateTournamentAvailableFriends();
				await createTournamentLoadAvailableFriends();
			}

			// load back header in case a friend left a tournament and is now available
			await clearHomepageHeader();
			await loadHomepageHeader();

			return ;
		}

		if (data.Action === 'nameChange') {
			var tournament = data.Tournament;
			var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');
			var	newName = data.Data;

			if (g_state.pageToDisplay == '.tournament-info' && tournamentId == tournament.Id) {
				document.querySelector('.tournament-info-name').textContent = newName;
			}

			if (g_state.pageToDisplay == '.my-tournaments') {
				await clearMyTournaments();
				await loadMyTournaments();
			}
			return ;
		}

		if (data.Action === 'tournamentState') {
			var tournament = data.Tournament;
			var	tournamentId = document.querySelector('.tournament-info-name').getAttribute('tournament-id');

			if (g_state.pageToDisplay == '.tournament-info' && tournamentId == tournament.Id) {
				// clear bracket
				document.querySelectorAll('.bracket-player').forEach(function(item) {
					item.innerHTML = '';
				});

				// load bracket
				try {
					await loadTournamentBracket(tournament, tournament.Confirmed, tournament.NumPlayers);
				} catch (error) {
					console.error(error);
				}
			}
			return ;
		}
    };
}

