function add_coubertin_in_url(url) {
    return ("/coubertin/tournament/" + url)
}

// Functions working
async function create_tournament(Name, NumPlayers, Invited, Admin) {
    json = JSON.stringify({Name: Name, NumPlayers: NumPlayers, Invited: Invited, Admin: Admin});
    
    return fetch_post(add_coubertin_in_url('infos/'));
}

async function change_tournament_name(NewName, TournamentId) {
    json = JSON.stringify({NewName: NewName, TournamentId: TournamentId});

    return fetch_patch(add_coubertin_in_url('infos/'));
}
            
async function remove_player_from_tournament(TournamentId) {
    json = JSON.stringify({TournamentIdId: TournamentId});

    return fetch_patch(add_coubertin_in_url('entry/'));
}

async function invite_friend_to_tournament(TournamentId, Invited) {
    json = JSON.stringify({TournamentId: TournamentId, Invited: Invited});

    return fetch_post(add_coubertin_in_url('entry/'));
}

async function join_tournament(TournamentId) {
    json = JSON.stringify({TournamentId: TournamentId});

    return fetch_post(add_coubertin_in_url('entry/'));
}

async function get_my_tournaments() {
    json = JSON.stringify({});

    return fetch_get(add_coubertin_in_url('mytournaments/'));
}

async function get_tournaments_available() {
    json = JSON.stringify({id: -1});

    return fetch_get(add_coubertin_in_url('infos/'));
}

async function get_tournament_infos(tournamentId) {
    json = JSON.stringify({id: tournamentId});

    return fetch_get(add_coubertin_in_url('infos/'));
}

