function add_ludo_in_url(url) {
    return ("/ludo/pong/" + url)
}

async function get_game_room_name(playerId) {
    json = {Id: playerId};

    fetch_get(add_ludo_in_url("ongoingGames/"), json);
}