function add_mnemosine_to_url(url) {
    return ("/mnemosine/memory" + url);
}

function get_game_history(id) {
    return fetch_get(add_mnemosine_to_url("/players/" + id));
}

function get_tournament_history(id) {
    return fetch_get(add_mnemosine_to_url("/tournaments/" + id));
}
