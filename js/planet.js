// planet.js - Planet with a sun it orbits
// Author(s): Lyle Watkins
// Last Updated: 5/29/2025

class Planet {
    constructor() {
        // Maybe radius and orbit time can be randomized for more variety in output
        this.rad = PLANET_RADIUS;
        this.orbitTime = PLANET_ORBIT_TIME; // 2 minute orbit
        this.sunAngle = createVector(1, 0.25, -0.75);
        this.sunAngleXZ = createVector(this.sunAngle.x, this.sunAngle.z);
        this.createTerrain();
    }

    update() {
        let angle = 360 / (60 * this.orbitTime);
        this.sunAngleXZ.rotate(angle);
        this.sunAngle = createVector(this.sunAngleXZ.x, this.sunAngle.y, this.sunAngleXZ.y);
    }

    drawDebugVerts() {
        push();
        strokeWeight(10);
        for (let i = 0; i < this.verts.length; i++) {
            if (i < 4) stroke(250 - i * 50, 0, 0);
            else if (i < 8) stroke(0, 250 - (i - 4) * 50, 0);
            else stroke(0, 0, 250 - (i - 8) * 50);
            point(this.verts[i]);
        }
        pop();
    }

    createTerrain(depth) {
        // Free any previous terrain to save memory
        if (this.terrain) freeGeometry(this.terrain);

        let y = this.rad / 1.5;
        let x = y * GOLDEN_RATIO;
        this.verts = [];

        // Create basic icosahedron verticies
        this.verts.push(createVector(-x, y, 0));
        this.verts.push(createVector(x, y, 0));
        this.verts.push(createVector(x, -y, 0));
        this.verts.push(createVector(-x, -y, 0));
        this.verts.push(vectorRotateXY(this.verts[0], 90));
        this.verts.push(vectorRotateXY(this.verts[1], 90));
        this.verts.push(vectorRotateXY(this.verts[2], 90));
        this.verts.push(vectorRotateXY(this.verts[3], 90));
        this.verts.push(vectorRotateXY(this.verts[4], 90));
        this.verts.push(vectorRotateXY(this.verts[5], 90));
        this.verts.push(vectorRotateXY(this.verts[6], 90));
        this.verts.push(vectorRotateXY(this.verts[7], 90));

        this.terrain = new p5.Geometry();
        for (let vert of this.verts) this.terrain.vertices.push(vert);
        for (let face of ICOSPHERE_FACES) {
            // Get face vertices
            let v1i = face[0];
            let v2i = face[1];
            let v3i = face[2];
            let v1 = this.verts[v1i];
            let v2 = this.verts[v2i];
            let v3 = this.verts[v3i];
            // Create new slerped vertices, subdividing original face
            let v4 = p5.Vector.slerp(v1, v2, 0.5);
            let v5 = p5.Vector.slerp(v2, v3, 0.5);
            let v6 = p5.Vector.slerp(v3, v1, 0.5);
            this.terrain.vertices.push(v4, v5, v6);
            let v4i = this.terrain.vertices.indexOf(v4);
            let v5i = this.terrain.vertices.indexOf(v5);
            let v6i = this.terrain.vertices.indexOf(v6);
            // Add new faces to the mesh
            this.terrain.faces.push(
                [v1i, v4i, v6i],
                [v4i, v5i, v6i],
                [v5i, v3i, v6i],
                [v4i, v2i, v5i]
            );
        }
        // This makes the lighting work
        this.terrain.computeNormals(SMOOTH);
    }

    drawPlanet() {
        push();
        noStroke();
        ambientLight(50);
        directionalLight(color(255), this.sunAngle); // Sun
        fill(20, 50, 200);
        sphere(this.rad);
        fill(50, 200, 80);
        model(this.terrain);
        pop();
    }

    drawStar() {
        push();
        let sunPos = p5.Vector.mult(this.sunAngle, -SUN_DISTANCE);
        translate(sunPos.x, sunPos.y, sunPos.z);
        fill(255, 255, 0);
        sphere();
        pop();
    }

    draw() {
        this.drawPlanet();
        this.drawDebugVerts();
        this.drawStar();
    }
}