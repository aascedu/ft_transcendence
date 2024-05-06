// Modify avatar (check if it is user profile before !)

// Show edit button on hover / focus
document.querySelector('.user-profile-picture').addEventListener('mouseover', function() {
	document.querySelector('.user-profile-picture label').classList.remove('visually-hidden');
});
document.querySelector('.user-profile-picture').addEventListener('focusin', function() {
	document.querySelector('.user-profile-picture label').classList.remove('visually-hidden');
});

// Upload an image and check its size
document.querySelector('.user-profile-picture input').addEventListener('change', function(event) {
	var	file = event.target.files[0];
	var	maxSize = 1024 * 1024 * 10; // 10MB
	var	maxWidth = 2000;
	var	maxHeight = 2000;
	var	minWidth = 200;
	var	minHeight = 200;

	if (file) {
		if (file.size > maxSize) {
			sendImageAlert("max-image-weight");
			event.target.value = '';
		}
		var	reader = new FileReader();
		reader.onload = function(e) {
            		var img = new Image();
            		img.onload = function() {
				if (this.width > maxWidth || this.height > maxHeight) {
					sendImageAlert("max-image-size");
			                e.target.value = '';
			        }
				else if (this.width < minWidth || this.height < minHeight) {
					sendImageAlert("min-image-size");
                    			e.target.value = '';
                		}
				else {
					var	url = reader.result;
                    			document.querySelector('.user-profile-picture > img').setAttribute('src', url);
					document.querySelector('.homepage-header-profile > img').setAttribute('src', url);
                		}
            		};
            		img.src = e.target.result;
        	};
        reader.readAsDataURL(file);
	}
});

// Send correct alert if image does not respect max / min size
function sendImageAlert(data) {
	document.querySelector('.user-profile-image-alert .alert-message').setAttribute('data-language', data);
	var locale = document.querySelector('.homepage-header-language-selector button img').alt;
	switchLanguageContent(locale);
	document.querySelector('.user-profile-image-alert').classList.remove('visually-hidden');
	document.querySelector('.user-profile-image-alert .alert-confirm-button').focus();
}

// Close alert
document.querySelector('.user-profile-image-alert .alert-confirm-button').addEventListener('click', function() {
	document.querySelector('.user-profile-image-alert').classList.add('visually-hidden');
});
document.querySelector('.user-profile-image-alert .alert-confirm-button').addEventListener('keypress', function(e) {
	if (e.key == 'Enter') {
		document.querySelector('.user-profile-image-alert').classList.add('visually-hidden');
	}
});

// Hide edit button on hover / focus
document.querySelector('.user-profile-picture').addEventListener('mouseleave', function() {
	document.querySelector('.user-profile-picture label').classList.add('visually-hidden');
});
document.querySelector('.user-profile-picture').addEventListener('focusout', function() {
	document.querySelector('.user-profile-picture label').classList.remove('visually-hidden');
});

// Ask for confirmation when inviting friend

document.querySelector('.user-profile-add-icon').addEventListener('click', function() {
	document.querySelector('.user-profile-invite-alert').classList.remove('visually-hidden');
	document.querySelector('.user-profile-invite-alert .alert-confirm-button').focus();
});

	// Confirm / cancel the invitation

document.querySelector('.user-profile-invite-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');

	inviteSentNotif(document.querySelector('.user-profile-name').textContent);
	document.querySelector('.user-profile-add-icon').classList.add('visually-hidden');
	document.querySelector('.user-profile-pending-icon').classList.remove('visually-hidden');
});
document.querySelector('.user-profile-invite-alert .alert-confirm-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');
	
		inviteSentNotif(document.querySelector('.user-profile-name').textContent);
		document.querySelector('.user-profile-add-icon').classList.add('visually-hidden');
		document.querySelector('.user-profile-pending-icon').classList.remove('visually-hidden');
	}
});

document.querySelector('.user-profile-invite-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');
});
document.querySelector('.user-profile-invite-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-invite-alert').classList.add('visually-hidden');
	}
});

// Ask for confirmation when removing friend

document.querySelector('.user-profile-remove-icon').addEventListener('click', function() {
	document.querySelector('.user-profile-remove-alert').classList.remove('visually-hidden');
	document.querySelector('.user-profile-remove-alert .alert-confirm-button').focus();
});

	// Confirm / cancel the remove

document.querySelector('.user-profile-remove-alert .alert-confirm-button').addEventListener('click', function () {
	document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');

	document.querySelector('.user-profile-remove-icon').classList.add('visually-hidden');
	document.querySelector('.user-profile-add-icon').classList.remove('visually-hidden');
});
document.querySelector('.user-profile-remove-alert .alert-confirm-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');
	
		document.querySelector('.user-profile-remove-icon').classList.add('visually-hidden');
		document.querySelector('.user-profile-add-icon').classList.remove('visually-hidden');
	}
});

document.querySelector('.user-profile-remove-alert .alert-cancel-button').addEventListener('click', function () {
	document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');
});
document.querySelector('.user-profile-remove-alert .alert-cancel-button').addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.user-profile-remove-alert').classList.add('visually-hidden');
	}
});

// Current shape graph

function drawGraph() {
	const canvas = document.querySelector('.user-profile-stats-graph');
	if (!canvas.getContext) {
		return;
	}
	canvas.width = canvas.parentElement.offsetWidth;
	canvas.height = '450';

	const ctx = canvas.getContext('2d');

	ctx.strokeStyle = '#7300E6';
	ctx.fillStyle = '#7300E6';
	ctx.lineWidth = 3;

	// draw lines
	ctx.beginPath();
	ctx.moveTo(50, 400);
	ctx.lineTo(100, 350);
	ctx.lineTo(150, 300);
	ctx.lineTo(200, 250);
	ctx.lineTo(250, 300);
	ctx.lineTo(300, 250);
	ctx.lineTo(350, 300);
	ctx.lineTo(400, 350);
	ctx.lineTo(450, 300);
	ctx.lineTo(500, 250);
	ctx.lineTo(550, 200);
	ctx.lineTo(600, 250);
	ctx.lineTo(650, 200);
	ctx.lineTo(700, 150);
	ctx.lineTo(750, 200);
	ctx.lineTo(800, 250);
	ctx.stroke();

	// draw points
	ctx.beginPath();
	ctx.moveTo(50, 400);
	ctx.arc(50, 400, 5, 0, 2*Math.PI);
	ctx.moveTo(100, 350);
	ctx.arc(100, 350, 5, 0, 2*Math.PI);
	ctx.moveTo(150, 300);
	ctx.arc(150, 300, 5, 0, 2*Math.PI);
	ctx.moveTo(200, 250);
	ctx.arc(200, 250, 5, 0, 2*Math.PI);
	ctx.moveTo(250, 300);
	ctx.arc(250, 300, 5, 0, 2*Math.PI);
	ctx.moveTo(300, 250);
	ctx.arc(300, 250, 5, 0, 2*Math.PI);
	ctx.moveTo(350, 300);
	ctx.arc(350, 300, 5, 0, 2*Math.PI);
	ctx.moveTo(400, 350);
	ctx.arc(400, 350, 5, 0, 2*Math.PI);
	ctx.moveTo(450, 300);
	ctx.arc(450, 300, 5, 0, 2*Math.PI);
	ctx.moveTo(500, 250);
	ctx.arc(500, 250, 5, 0, 2*Math.PI);
	ctx.moveTo(550, 200);
	ctx.arc(550, 200, 5, 0, 2*Math.PI);
	ctx.moveTo(600, 250);
	ctx.arc(600, 250, 5, 0, 2*Math.PI);
	ctx.moveTo(650, 200);
	ctx.arc(650, 200, 5, 0, 2*Math.PI);
	ctx.moveTo(700, 150);
	ctx.arc(700, 150, 5, 0, 2*Math.PI);
	ctx.moveTo(750, 200);
	ctx.arc(750, 200, 5, 0, 2*Math.PI);
	ctx.moveTo(800, 250);
	ctx.arc(800, 250, 5, 0, 2*Math.PI);
	ctx.fill();
}

drawGraph();


// Keyboard navigation

document.addEventListener('keydown', function(e) {
	if (!document.querySelector('.user-profile').classList.contains('visually-hidden')) {
		if (e.key === 'Tab') {
			document.querySelector('.homepage-header-logo').focus();
			e.preventDefault();
		}
	}
});

document.addEventListener('focusout', function(e) {
	if (e.target === document.querySelector('.user-profile-picture-input')) {
		document.querySelector('.user-profile-picture label').classList.add('visually-hidden');
	}
});
