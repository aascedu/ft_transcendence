function add_petrus_in_url(url) {
    return ("/petrus/auth" + url);
}

async function get_id_by_nickname(nick_name) {
    return fetch_get(add_petrus_in_url("/signin/" + nick_name))
            .then(data => {
                return data.Id
            });
}

async function post_signin(id, password) {
    json = {Id: id, Pass : password};

    return fetch_post(add_petrus_in_url('/signin/' + "nickname"), json);
}

async function post_signup(id, password, mail) {
    json = {Id: id, Pass: password, Email: mail};
    return fetch_post(add_petrus_in_url('/signin/' + "nickname"), json);
}

async function post_jwt_refresh(refresh_token) {
    json = {ref: refresh_token,};

    return await fetch_post(add_petrus_in_url('/JWT-refresh'), json)
            .then(data => {
                return data.Ref
            });
}


async function refreshLoopThis(refresh_token) {
    milliseconds = 150000;
    console.log(refresh_token);
    const interval_refresh = setInterval(() => {
        post_jwt_refresh(refresh_token)
    }, milliseconds);
}
