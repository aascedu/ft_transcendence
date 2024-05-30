async function fetch_get(url) {
    return fetch_with_jwt(url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok)
                throw custom_error(response)
            return response.json()
        })
        .then(data => {
            console.log(data)
            return data
        })
        .catch ( error => console.error(error) )
}

async function fetch_post(url, json) {
    return fetch_with_jwt(url,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(json)
        })
		.then (response => {
			if (!response.ok) {
				throw custom_error(response)
			}
			return response.json();
		})
        .then (data => {
            console.log(data)
            return data
        })
        .catch ( error => console.error(error) )
}

async function fetch_delete(url) {
    return fetch_with_jwt(url, {
                method: 'DELETE',
            }
        )
        .then (response => {
            if (!response.ok) {
                throw custom_error(response);
            }
            return response.json();
        })
        .then (data => {
            console.log(data);
            return data;
        })
        .catch ( error => console.error(error) )
}

async function fetch_patch(url, json) {
    return fetch_with_jwt(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(json),
        })
        .then (response => {
            if (!response.ok) {
                throw custom_error(response);
            }
            return response;
        })
        .then (data => {
            console.log(data);
            return data;
        })
        .catch ( error => fetch_error(error) );
}

async function fetch_with_jwt(url, request) {
    jwt = sessionStorage.getItem(JWT_NAME)
    if (jwt !== null) {
        request.headers.Auth = sessionStorage.getItem(JWT_NAME);
    }
    response = await fetch(url, request);
    if (response.status == 401) {
        await reconnection_alert();
        request.headers.Auth = sessionStorage.getItem(JWT_NAME);
        response = await fetch(url, request);
    }
    return response;
}

function reconnection_alert() {
}

function fetch_error(error) {
    console.error('Fetch problem:', error.message);
}

function custom_error(response) {
    console.error(response.json());
    return new Error('HTTP error: ' + response.status + "-" + response.json())
}
