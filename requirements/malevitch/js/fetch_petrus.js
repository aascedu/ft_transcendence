function add_petrus_in_url(url) {
    return ("/petrus/auth" + url)
}

async function get_id_by_nickname(nick_name) {
    return fetch(add_petrus_in_url("/signin/" + nick_name))
            .then(response => {
                if (response.status != 200) {
                    throw custom_error(response)
                }
                return response.json()
            })
            .then(data => {
                console.log(data)
                return data
            })
            .then(data => {
                return data.Id
            })
            .catch( error => {
                fetch_error(error)
                return null
            });
}

async function post_signin(id, password) {
    json = JSON.stringify({Id: id, Pass : password,})
    method = 'POST'
    headers = {'Content-Type': 'application/json',}

    return fetch(add_petrus_in_url('/signin/' + "nickname"),
                {
                    json: json,
                    method: method,
                    headers: headers,
                }
            )
            .then(response => {
                if (response.status != 200) {
                    throw custom_error(response)
                }
                return response.json()
            })
            .then(data => {
                console.log(data)
                return data
            })
            .then(data => {
                return data.Ref
            })
            .catch( error => {
                fetch_error(error)
                return null
            })
}

async function post_jwt_refresh(refresh_token) {
    json = JSON.stringify({Ref: refresh_token,})
    method = 'POST'
    headers = {'Content-Type': 'application/json',}

    return fetch(add_petrus_in_url('/JWT-refresh'),
                {
                    body: json,
                    method: method,
                    headers: headers,
                }
            )
            .then(response => {
                if (response.status != 200) {
                    throw custom_error(response)
                }
                return response.json()
            })
            .then(data => {
                console.log(data)
                return data
            })
            .then(data => {
                return data.Ref
            })
            .catch( error => {
                fetch_error(error)
                return null
            })

}
