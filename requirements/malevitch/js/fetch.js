   // path("sessions/<int:id>", sessionView.as_view()),
    //path("users/<int:id>", userInfoView.as_view()),
   // path("friends/<int:id>", friendView.as_view()),
  //  path("avatar/<int:id>", avatarView.as_view()),
 //   path("media/<str:filename>", serve_avatar),
//    path("view-db", view_db)

function add_alfred_in_url(url) {
    return ("/alfred/user" + url)
}

function user_url(id) {
    return add_alfred_in_url("/users/" + id)
}

function fetch_get(url) {
    return fetch(url)
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log(data)
            })
            .catch(error => console.error());
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
    fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    })
    .then(response => {return response.json()})
    .then(data => console.log(data))
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
	fetch(friend_url(id),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )
		.then (response => {
			if (!response.ok) {
				throw new Error('HTTP error: ' + response.status);
			}
			return response.json();
		})
		.then (data => {
            console.log(data)
		})
		.catch (error => {
			console.error('Fetch problem:', error.message);
		});
}

async function delete_friend(id) {
    fetch(friend_url(id),
        {
            method: 'DELETE',
        }
    )
    .then (response => {
        if (!response.ok) {
            throw new Error('HTTP error: ' + response.status);
        }
        return response.json();
    })
    .then (data => {
        console.log(data)
    })
    .catch (error => {
        console.error('Fetch problem:', error.message);
    });
}


