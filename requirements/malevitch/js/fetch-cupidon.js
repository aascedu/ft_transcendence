function add_cupidon_in_url(url) {
    return ("/cupidon/matchmaking/" + url)
}

async function invite_friend_to_game(PlayerToInvite) {
    json = {PlayerToInvite: PlayerToInvite};

    fetch_post(add_cupidon_in_url("game-request/"), json);
}

async function cancel_invitation_to_game() {
    fetch_delete(add_cupidon_in_url("game-request/"))
}

async function accept_invitation_to_game(requester, invited) {
    fetch_post(add_cupidon_in_url("game-request-response/" + requester + "/" + invited + "/"), json={});
}

async function refuse_invitation_to_game(requester, invited) {
    fetch_delete(add_cupidon_in_url("game-request-response/" + requester + "/" + invited + "/"));
}