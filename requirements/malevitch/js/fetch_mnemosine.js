function add_mnemosine_to_url(url) {
    return ("/mnemosine/memory" + url);
}

function get_game_history(id) {
    return fetch_get(add_mnemosine_to_url("/pong/players/" + id));
}

function get_tournament_history(id) {
    return fetch_get(add_mnemosine_to_url("/pong/tournaments/" + id));
}