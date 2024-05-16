async function fetch_get(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok != 200)
                throw new Error('HTTP error: ' + response.Err);
            return response.json()
        })
        .then(data => {
            console.log(data)
            return data
        })
}

async function fetch_post(url, json) {
    return fetch(url,
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
}

async function fetch_delete(url) {
    return fetch (url,
        {
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
}

async function fetch_patch(url, json) {
    return fetch (url, {
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
        });
    }


function fetch_error(error) {
    console.error('Fetch problem:', error.message)
}

function custom_error(response) {
    return new Error('HTTP error: ' + response.status + "-" + response.Err)
}

fetch_get("/petrus/their").catch(error => fetch_error(error))

