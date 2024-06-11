function add_coubertin_in_url(url) {
    return ("/coubertin/tournament/" + url)
}

async function get_tournament_infos(TournamentId) {
    return fetch_get(add_coubertin_in_url('infos/' + TournamentId + '/'));
}

async function create_tournament(Name, NumPlayers, Invited, Admin) {
    json = {Name: Name, NumPlayers: NumPlayers, Invited: Invited, Admin: Admin};

    return fetch_post(add_coubertin_in_url('infos/0/'), json);
}

async function change_tournament_name(NewName, TournamentId) {
    json = {NewName: NewName, TournamentId: TournamentId};

    return fetch_patch(add_coubertin_in_url('infos/0/'), json);
}

async function remove_player_from_tournament(TournamentId, PlayerId) {
    return fetch_delete(add_coubertin_in_url('entry/' + TournamentId + '/' + PlayerId + '/'));
}

async function join_tournament(TournamentId, PlayerAlias) {
    json = {'Alias': PlayerAlias}

    return fetch_post(add_coubertin_in_url('entry/' + TournamentId + '/0/'), json);
}

async function invite_friend_to_tournament(TournamentId, Invited) {
    json = {TournamentId: TournamentId, Invited: Invited};

    return fetch_post(add_coubertin_in_url('invite/'), json);
}

async function get_my_tournaments() {
    return fetch_get(add_coubertin_in_url('my-tournaments/'));
}

async function get_tournaments_available() {
    return fetch_get(add_coubertin_in_url('available-tournaments/'));
}

async function start_tournament(TournamentId) {
    json = {TournamentId: TournamentId};

    return fetch_post(add_coubertin_in_url('start-tournament/'), json);
}

