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
    console.log('fetch with jwt called');
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function reconnection_alert() {
    var alert = document.querySelector('.reconnection-alert')
    alert.classList.remove('visually-hidden');

	document.querySelector('.reconnection-input').focus();
    setAriaHidden();
    while (!alert.classList.contains('visually-hidden')) {
        await sleep(200);
    }
}

function fetch_error(error) {
    console.error('Fetch problem:', error.message);
}

function custom_error(response) {
    console.error(response.json());
    return new Error('HTTP error: ' + response.status + "-" + response.json())
}
