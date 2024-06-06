function add_ludo_in_url(url) {
    return ("/cupidon/matchmaking/" + url)
}

async function invite_friend_to_game(playerToInvite) {
    json = {playerToInviteId: playerToInvite};

    fetch_post(add_ludo_in_url("request-game/"), json);
}

async function accept_invitation_to_game(requester, invited) {
    fetch_post(add_ludo_in_url("request-game/" + requester + "/" + invited + "/"), json);
}

async function refuse_invitation_to_game(requester, invited) {
    fetch_delete(add_ludo_in_url("request-game/" + requester + "/" + invited + "/"), json);
}