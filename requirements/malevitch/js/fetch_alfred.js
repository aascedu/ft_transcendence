//path("sessions/<int:id>", sessionView.as_view()),
//path("users/<int:id>", userInfoView.as_view()),
//path("friends/<int:id>", friendView.as_view()),
//path("avatar/<int:id>", avatarView.as_view()),
//path("media/<str:filename>", serve_avatar),
//path("view-db", view_db)

function add_alfred_in_url(url) {
    return ("/alfred/user" + url)
}

function user_url(id) {
    return add_alfred_in_url("/users/" + id)
}


async function get_user_info(id) {
    return fetch_get(user_url(id))
}

async function patch_user_info(id, lang, font, nick, email, contrast_mode) {
    url = user_url(id)
    json = {}
    if (lang != null) {
        json['Lang'] = lang
    }
    if (font != null) {
        json['Font'] = font
    }
    if (nick != null) {
        json['Nick'] = nick
    }
    if (email != null) {
        json['Email'] = email
    }
    if (contrast_mode != null) {
        json['Contrast-mode'] = contrast_mode
    }
    fetch_patch(url, json)
    .catch(error => console.error('Erreur:', error));
}

function friend_url(id) {
    return add_alfred_in_url("/friends/" + id)
}

function avatar_url(id) {
    return add_alfred_in_url("/avatar/" + id)
}

async function get_friend(id) {
    return fetch_get(friend_url(id))
}

async function post_friend(id) {
	return fetch_post(friend_url(id), {})
		.catch (error => {
			console.error('Fetch problem:', error.message);
		});
}

async function delete_friend(id) {
    return fetch_delete(friend_url(id))
    .catch (error => {
        console.error('Fetch problem:', error.message);
    });
}

function avatar_url(id) {
    return add_alfred_in_url("/avatar/" + id)
}

async function get_media_from_url(url) {
    return await fetch_get(add_alfred_in_url(url))
}

async function get_avatar_from_id(id) {
    return
    fetch_get(avatar_url(id))
    .then (data => {
        if (data != null) {
            return fetch_get(add_alfred_in_url(data['url']))
                .then (response => {
                    if (response.status != 200) {
                        throw custom_error(response)
                    }
                    return response
                })
        }
        else {
            return basic_url;
        }
    })
    .catch ( error => {
        fetch_error(error)
    });
}

