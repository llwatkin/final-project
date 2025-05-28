// planet.js - Planet with a sun it orbits
// Author(s): Lyle Watkins
// Last Updated: 5/22/2025

class Planet {
    constructor() {
        // Maybe radius and orbit time can be randomized for more variety in output
        this.rad = PLANET_RADIUS;
        this.orbitTime = PLANET_ORBIT_TIME; // 2 minute orbit
        this.sunAngle = createVector(1, 0.25, -0.75);
        this.sunAngleXZ = createVector(this.sunAngle.x, this.sunAngle.z);
    }

    update() {
        let angle = 360 / (60 * this.orbitTime);
        this.sunAngleXZ.rotate(angle);
        this.sunAngle = createVector(this.sunAngleXZ.x, this.sunAngle.y, this.sunAngleXZ.y);
    }

    draw() {
        // Planet
        push();
        ambientLight(50);
        directionalLight(color(255), this.sunAngle); // Sun
        print(this.sunAngle);
        noStroke();
        fill(20, 50, 200);
        sphere(this.rad);
        pop();

        // Sun
        push();
        let sunPos = p5.Vector.mult(this.sunAngle, -SUN_DISTANCE);
        translate(sunPos.x, sunPos.y, sunPos.z);
        fill(255, 255, 0);
        sphere();
        pop();
    }
}