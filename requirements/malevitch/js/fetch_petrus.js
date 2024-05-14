function add_petrus_in_url(url) {
    return ("/petrus/auth" + url)
}

function get_id_by_nickname(nick_name) {
    return fetch(add_petrus_in_url("/signin/" + nick_name)
}
