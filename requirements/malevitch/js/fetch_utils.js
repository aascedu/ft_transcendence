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
            return data
        });
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
            return data
        });
}

async function fetch_delete(url) {
    return fetch_with_jwt(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        .then (response => {
            if (!response.ok) {
                throw custom_error(response);
            }
            return response.json();
        })
        .then (data => {
            return data;
        });
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
            return data;
        });
}

async function fetch_with_jwt(url, request) {
    response = await fetch(url, request);
    if (response.status == 401) {
        await reconnection_alert();
        response = await fetch(url, request);
    }
    return response;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function reconnection_alert() {
    var alert = document.querySelector('.reconnection-alert');

	alert.querySelector('.reconnection-alert-nickname').textContent = g_userNick;

    alert.classList.remove('visually-hidden');

	document.querySelector('.reconnection-input').focus();
    setAriaHidden();
    while (!alert.classList.contains('visually-hidden')) {
        await sleep(200);
    }
}

async function custom_error(response) {
    json = await response.json()
    if (json.Err === undefined) {
        console.error("Error not from transcendence Django api");
    } else {
        console.error(json.Err);
    }
    const error = new Error('HTTP error: ' + response.status + ' : ' + json.Err);
    error.name = json.Err;
    error.value = json;
    return error;
}
