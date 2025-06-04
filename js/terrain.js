// terrain.js - Icospheric terrain for planet
// Author(s): Lyle Watkins
// Last Updated: 06/03/2025

class Terrain {
	constructor(rad) {
		this.rad = rad;
		this.debugVerts = [];

		this.generateMesh();
	}

	generateMesh() {
		// Free any previous terrain to save memory
		if (this.mesh) this.clearTerrain();
		this.mesh = new p5.Geometry();

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
		for (let vert of this.debugVerts) {
			this.mesh.vertices.push(vert);
		}
		for (let face of ICOSAHEDRON_FACES) {
			this.subdivide(face, [], 0);
		}

		// Vary the terrain vertices using Perlin noise
		this.varyTerrain();

		// This makes the lighting work
		this.mesh.computeNormals(FLAT);
	}

	varyTerrain() {
		let noiseScale = NOISE_SCALE;
		for (let i = 0; i < this.mesh.vertices.length; i++) {
			let vert = this.mesh.vertices[i];
			let variation = map(
				noise(noiseScale * i),
				0, 1,
				vert.mag() - MIN_TERRAIN_MOD,
				vert.mag() + MAX_TERRAIN_MOD
			);
			vert.setMag(variation);
		}
	}

	clearTerrain() {
		freeGeometry(this.mesh);
		this.debugVerts = [];
	}

	subdivide(face, faces, level) {
		// Base case
		if (level == TERRAIN_FIDELITY) {
			for (let f of faces) if (this.mesh.faces.indexOf(f) == -1) this.mesh.faces.push(f);
			return;
		}

		// Get face vertices
		let v1i = face[0];
		let v2i = face[1];
		let v3i = face[2];
		let v1 = this.mesh.vertices[v1i];
		let v2 = this.mesh.vertices[v2i];
		let v3 = this.mesh.vertices[v3i];

		// Create new slerped vertices, subdividing original face
		let v4 = p5.Vector.slerp(v1, v2, 0.5);
		let v5 = p5.Vector.slerp(v2, v3, 0.5);
		let v6 = p5.Vector.slerp(v3, v1, 0.5);
		let v4i = -1;
		let v5i = -1;
		let v6i = -1;

		// Check if vertices in these locations already exist before adding new ones
		for (let vert of this.mesh.vertices) {
			if (isRoundedVectorEqual(v4, vert)) {
				v4 = vert;
				v4i = this.mesh.vertices.indexOf(v4);
			}
			else if (isRoundedVectorEqual(v5, vert)) {
				v5 = vert;
				v5i = this.mesh.vertices.indexOf(v5);
			}
			else if (isRoundedVectorEqual(v6, vert)) {
				v6 = vert;
				v6i = this.mesh.vertices.indexOf(v6);
			}
		}

		// If no existing vertices were found, create new ones
		if (v4i == -1) {
			this.mesh.vertices.push(v4);
			v4i = this.mesh.vertices.indexOf(v4);
		}
		if (v5i == -1) {
			this.mesh.vertices.push(v5);
			v5i = this.mesh.vertices.indexOf(v5);
		}
		if (v6i == -1) {
			this.mesh.vertices.push(v6);
			v6i = this.mesh.vertices.indexOf(v6);
		}

		// Save new faces for later
		let newFaces = [
			[v1i, v4i, v6i],
			[v4i, v5i, v6i],
			[v5i, v3i, v6i],
			[v4i, v2i, v5i]
		];

		// Continue subdividing
		for (let f of newFaces) {
			this.subdivide(f, newFaces, level + 1);
		}
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

	draw() {
		fill(50, 200, 80);
		model(this.mesh);
	}
}