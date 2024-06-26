function add_petrus_in_url(url) {
    return ("/petrus/auth" + url);
}

async function post_signin(id, password) {
    json = {Id: id, Pass : password};

    return fetch_post(add_petrus_in_url('/signin/nickname/'), json);
}

async function signup(nick, email, password, lang, font) {
    json = {
        Nick: nick,
        Email: email,
        Pass: password,
        Lang: lang,
        Font: font,
    };

    try {
        return await fetch_post(
            '/petrus/auth/signup/',
            json)
        .then(result => {
            g_userNick = nick;
            g_userId = result.Client;
            jwt_management(result.Auth, result.Ref);
            patchUserContent();
            goToHomepageGame('.sign-up');
        });
    } catch (error) {
        error = await error;
        console.error(error);
    }
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
    milliseconds = 200000;
    g_refreshInterval = setInterval(() => {
        post_jwt_refresh()
    }, milliseconds);
}

function delete_cookies() {
    content = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        };

    return fetch(add_petrus_in_url('/JWT-refresh/'), content);
}
