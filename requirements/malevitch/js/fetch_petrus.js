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
    json = {Ref: sessionStorage.getItem(REF_TOKEN_NAME)};
    content = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Auth' : sessionStorage.getItem(JWT_NAME),
            },
            body: JSON.stringify(json)
        };

    sessionStorage.setItem(JWT_NAME, await fetch(add_petrus_in_url('/JWT-refresh/'), content)
            .then(response => {
                return response.json();
            })
            .then(data => {
                return data.Auth;
            })
        );
}

async function connect(id, password, nickname) {
    const response = await fetch_post(add_petrus_in_url("/signin/" + nickname + "/"), {Id: id, Pass: password,});
    return response
}

async function refreshLoop() {
    milliseconds = 15000;
    const interval_refresh = setInterval(() => {
        post_jwt_refresh()
    }, milliseconds);
}
