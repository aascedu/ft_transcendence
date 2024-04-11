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