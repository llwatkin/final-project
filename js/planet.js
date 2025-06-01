// planet.js - Planet with a sun it orbits
// Author(s): Lyle Watkins
// Last Updated: 5/31/2025

class Planet {
    constructor() {
        // Maybe radius and orbit time can be randomized for more variety in output
        this.rad = PLANET_RADIUS;
        this.orbitTime = PLANET_ORBIT_TIME; // 2 minute orbit
        this.sunAngle = createVector(1, 0.25, -0.75);
        this.sunAngleXZ = createVector(this.sunAngle.x, this.sunAngle.z);
        this.debugVerts = [];
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
        for (let i = 0; i < this.debugVerts.length; i++) {
            if (i < 4) stroke(255, 0, 0);
            else if (i < 8) stroke(0, 255, 0);
            else stroke(0, 0, 255);
            point(this.debugVerts[i]);
        }
        pop();
    }

    createTerrain() {
        // Free any previous terrain to save memory
        if (this.terrain) this.clearTerrain();
        this.terrain = new p5.Geometry();

        let y = this.rad / 2;
        let x = y * GOLDEN_RATIO;

        // Create basic icosahedron vertices
        this.debugVerts.push(createVector(-x, y, 0));
        this.debugVerts.push(createVector(x, y, 0));
        this.debugVerts.push(createVector(x, -y, 0));
        this.debugVerts.push(createVector(-x, -y, 0));
        this.debugVerts.push(vectorRotateXY(this.debugVerts[0], 90));
        this.debugVerts.push(vectorRotateXY(this.debugVerts[1], 90));
        this.debugVerts.push(vectorRotateXY(this.debugVerts[2], 90));
        this.debugVerts.push(vectorRotateXY(this.debugVerts[3], 90));
        this.debugVerts.push(vectorRotateXY(this.debugVerts[4], 90));
        this.debugVerts.push(vectorRotateXY(this.debugVerts[5], 90));
        this.debugVerts.push(vectorRotateXY(this.debugVerts[6], 90));
        this.debugVerts.push(vectorRotateXY(this.debugVerts[7], 90));

        // Add debug verts and subdivide faces
        for (let vert of this.debugVerts) this.terrain.vertices.push(vert);
        for (let face of ICOSPHERE_FACES) this.subdivide(face, [], 0, TERRAIN_FIDELITY);

        // Vary the terrain vertices using Perlin noise
        this.varyTerrain();

        // This makes the lighting work
        this.terrain.computeNormals(FLAT);
    }

    varyTerrain() {
        let noiseScale = 0.2;
        for (let i = 0; i < this.terrain.vertices.length; i++) {
            let vert = this.terrain.vertices[i];
            let variation = map(noise(noiseScale * i), 0, 1, vert.mag() - MIN_TERRAIN_MOD, vert.mag() + MAX_TERRAIN_MOD);
            vert.setMag(variation);
        }
    }

    clearTerrain() {
        freeGeometry(this.terrain);
    }

    subdivide(face, faces, level, depth) {
        // Base case
        if (level == depth) {
            for (let f of faces) this.terrain.faces.push(f);
            return
        }

        // Get face vertices
        let v1i = face[0];
        let v2i = face[1];
        let v3i = face[2];
        let v1 = this.terrain.vertices[v1i];
        let v2 = this.terrain.vertices[v2i];
        let v3 = this.terrain.vertices[v3i];

        // Create new slerped vertices, subdividing original face (only adding verticies if they don't already exist)
        let v4 = p5.Vector.slerp(v1, v2, 0.5);
        let v5 = p5.Vector.slerp(v2, v3, 0.5);
        let v6 = p5.Vector.slerp(v3, v1, 0.5);
        for (let vert of this.terrain.vertices) {
            if (isRoundedVectorEqual(v4, vert)) v4 = vert;
            if (isRoundedVectorEqual(v5, vert)) v5 = vert;
            if (isRoundedVectorEqual(v6, vert)) v6 = vert;
        }
        let v4i = this.terrain.vertices.indexOf(v4);
        let v5i = this.terrain.vertices.indexOf(v5);
        let v6i = this.terrain.vertices.indexOf(v6);
        if (v4i == -1) {
            this.terrain.vertices.push(v4);
            v4i = this.terrain.vertices.indexOf(v4);
        }
        if (v5i == -1) {
            this.terrain.vertices.push(v5);
            v5i = this.terrain.vertices.indexOf(v5);
        }
        if (v6i == -1) {
            this.terrain.vertices.push(v6);
            v6i = this.terrain.vertices.indexOf(v6);
        }

        // Save new faces for later
        let newFaces = [
            [v1i, v4i, v6i],
            [v4i, v5i, v6i],
            [v5i, v3i, v6i],
            [v4i, v2i, v5i]
        ];

        // Continue subdividing
        for (let f of newFaces) this.subdivide(f, newFaces, level + 1, depth);
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
        //this.drawDebugVerts();
        this.drawStar();
    }
}