function add_coubertin_in_url(url) {
    return ("/coubertin/tournament/" + url)
}

// OK
async function create_tournament(Name, NumPlayers, Invited, Admin) {
    json = {Name: Name, NumPlayers: NumPlayers, Invited: Invited, Admin: Admin};

    return fetch_post(add_coubertin_in_url('infos/0/'), json);
}

// OK
async function change_tournament_name(NewName, TournamentId) {
    json = {NewName: NewName, TournamentId: TournamentId};

    return fetch_patch(add_coubertin_in_url('infos/0/'), json);
}

// OK
async function remove_player_from_tournament(TournamentId, PlayerId) {
    json = {TournamentId: TournamentId, PlayerId: PlayerId};

    return fetch_patch(add_coubertin_in_url('entry/'), json);
}

async function invite_friend_to_tournament(TournamentId, Invited) {
    json = {TournamentId: TournamentId, Invited: Invited};

    return fetch_post(add_coubertin_in_url('entry/'), json);
}

// OK
async function join_tournament(TournamentId) {
    json = {TournamentId: TournamentId};

    return fetch_post(add_coubertin_in_url('entry/'), json);
}

// OK
async function get_my_tournaments() {
    return fetch_get(add_coubertin_in_url('mytournaments/'));
}

// OK
async function get_tournaments_available() {
    return fetch_get(add_coubertin_in_url('available-tournaments/'));
}

// OK
async function get_tournament_infos(tournamentId) {
    return fetch_get(add_coubertin_in_url('infos/' + tournamentId + '/'));
}

