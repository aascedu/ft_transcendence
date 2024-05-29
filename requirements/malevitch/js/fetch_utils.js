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
    if (typeof g_jwtName!=="undefined") {
        request.headers.Auth = sessionStorage.getItem(g_jwtName);
    }
    return fetch(url, request)
}


function fetch_error(error) {
    console.error('Fetch problem:', error.message);
}

function custom_error(response) {
    return new Error('HTTP error: ' + response.status + "-" + response.json().Err)
}
