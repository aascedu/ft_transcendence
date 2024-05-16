function add_coubertin_in_url(url) {
    return ("/coubertin/tournament/" + url)
}

// Functions:

async function join_tournament(id) {
    json = JSON.stringify({Id: id});
    method = 'POST';
    headers = {'Content-Type': 'application/json',};

    return fetch(add_coubertin_in_url('/entry/'),
                {
                    json: json,
                    method: method,
                    headers: headers,
                }
            )
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
}

async function remove_player_from_tournament(id) {
    json = JSON.stringify({Id: id});
    method = 'PATCH';
    headers = {'Content-Type': 'application/json',};

    return fetch(add_coubertin_in_url('/entry/'),
                {
                    json: json,
                    method: method,
                    headers: headers,
                }
            )
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
}

// Peut-etre admin a add ici.
async function create_tournament(tournamentName, nbPlayers) {
    json = JSON.stringify({tournamentName: tournamentName, nbPlayers: nbPlayers});
    method = 'POST';
    headers = {'Content-Type': 'application/json',};
    
    return fetch(add_coubertin_in_url('/infos/'),
                {
                    json: json,
                    method: method,
                    headers: headers,
                }
            )
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
}

async function get_tournaments_available() {
    json = JSON.stringify({id: -1});
    method = 'GET';
    headers = {'Content-Type': 'application/json',};

    return fetch(add_coubertin_in_url('/infos/'),
                {
                    json: json,
                    method: method,
                    headers: headers,
                }
            )
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
}

async function get_tournament_infos(tournamentId) {
    json = JSON.stringify({id: tournamentId});
    method = 'GET';
    headers = {'Content-Type': 'application/json',};

    return fetch(add_coubertin_in_url('/infos/'),
                {
                    json: json,
                    method: method,
                    headers: headers,
                }
            )
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
}

