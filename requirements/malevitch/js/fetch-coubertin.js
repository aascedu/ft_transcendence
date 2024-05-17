function add_coubertin_in_url(url) {
    return ("/coubertin/tournament/" + url)
}

// Functions working
async function create_tournament(Name, NumPlayers, Invited, Admin) {
    json = JSON.stringify({Name: Name, NumPlayers: NumPlayers, Invited: Invited, Admin: Admin});
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

async function change_tournament_name(NewName, TournamentId) {
    json = JSON.stringify({NewName: NewName, TournamentId: TournamentId});
    method = 'PATCH';
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
            
async function remove_player_from_tournament(TournamentId) {
    json = JSON.stringify({TournamentIdId: TournamentId});
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

async function invite_friend_to_tournament(TournamentId, Invited) {
    json = JSON.stringify({TournamentId: TournamentId, Invited: Invited});
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

async function join_tournament(TournamentId) {
    json = JSON.stringify({TournamentId: TournamentId});
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

async function get_my_tournaments() {
    json = JSON.stringify({});
    method = 'GET';
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

