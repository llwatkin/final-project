// planet.js - Planet with a sun it orbits
// Author(s): Lyle Watkins
// Last Updated: 5/22/2025

class Planet {
    constructor(p) {
        // Maybe radius and orbit time can be randomized for more variety in output
        this.rad = PLANET_RADIUS;
        this.orbitTime = PLANET_ORBIT_TIME; // 2 minute orbit
        this.sunAngle = p.createVector(1, 0.25, -0.75);
        this.sunAngleXZ = p.createVector(this.sunAngle.x, this.sunAngle.z);
    }

    update(p) {
        let angle = 360 / (60 * this.orbitTime);
        this.sunAngleXZ.rotate(angle);
        this.sunAngle = p.createVector(this.sunAngleXZ.x, this.sunAngle.y, this.sunAngleXZ.y);
    }

    draw(p) {
        // Planet
        p.push();
        p.ambientLight(50);
        p.directionalLight(p.color(255), this.sunAngle); // Sun
        p.print(this.sunAngle);
        p.noStroke();
        p.fill(20, 50, 200);
        p.sphere(this.rad);
        p.pop();

        // Sun
        p.push();
        let sunPos = p5.Vector.mult(this.sunAngle, -SUN_DISTANCE);
        p.translate(sunPos.x, sunPos.y, sunPos.z);
        p.fill(255, 255, 0);
        p.sphere();
        p.pop();
    }
}