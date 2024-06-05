function add_petrus_in_url(url) {
    return ("/petrus/auth" + url);
}

async function post_signin(id, password) {
    json = {Id: id, Pass : password};

    return fetch_post(add_petrus_in_url('/signin/nickname/'), json);
}

async function post_signup(id, password, mail) {
    json = {Id: id, Pass: password, Email: mail};
    return fetch_post(add_petrus_in_url('/signin/nickname/'), json);
}

async function post_jwt_refresh() {
    content = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

    return fetch(add_petrus_in_url('/JWT-refresh/'), content);
}

async function connect(id, password, nickname) {
    return fetch_post(add_petrus_in_url("/signin/" + nickname + "/"), {Id: id, Pass: password,});
}

async function refreshLoop() {
    milliseconds = 15000;
    const interval_refresh = setInterval(() => {
        post_jwt_refresh()
    }, milliseconds);
}
