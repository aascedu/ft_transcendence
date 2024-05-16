function add_hermes_in_url(url) {
    return ("/hermes/notif" + url)
}

async function get_friend_list_online() {
    return fetch_get(add_hermes_in_url('/online-states'))
            .catch ( error => {fetch_error(error)} )
}
