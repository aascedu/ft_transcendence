function add_cupidon_in_url(url) {
    return ("/cupidon/matchmaking/" + url)
}

async function invite_friend_to_game(PlayerToInvite) {
    json = {PlayerToInvite: PlayerToInvite};

    fetch_post(add_cupidon_in_url("game-request/"), json);
    init_matchmaking_socket(g_userId, PlayerToInvite);
}

async function cancel_invitation_to_game() {
    fetch_delete(add_cupidon_in_url("game-request/"))
}

async function accept_invitation_to_game(requester, invited) {
    const RoomName = requester + "-" + invited
    fetch_post(add_cupidon_in_url("game-request-response/" + requester + "/" + invited + "/"), json={});
    showGamePage(RoomName);
}

async function refuse_invitation_to_game(requester, invited) {
    fetch_delete(add_cupidon_in_url("game-request-response/" + requester + "/" + invited + "/"));
}

async function clear_all_invitations() {
    cancel_invitation_to_game();
    refuse_invitation_to_game(0, g_userId);
}