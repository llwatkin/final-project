// stars.js - Planet with a sun it orbits and city cube clusters
// Author(s): Lyle Watkins
// Last Updated: 06/11/2025

class Stars {
	constructor() {
		this.imgTexture = loadImage("assets/stars.jpg");
	}

	draw() {
		push();
		noStroke();
		texture(this.imgTexture);
		box(STARBOX_SIZE);
		pop();
	}
}