// planet.js - Planet with a sun it orbits and city cube clusters
// Author(s): Lyle Watkins
// Last Updated: 06/02/2025

class Planet {
    constructor() {
        // Maybe radius and orbit time can be randomized for more variety in output
        this.rad = PLANET_RADIUS;
        this.orbitTime = PLANET_ORBIT_TIME; // 2 minute orbit
        this.sunAngle = createVector(1, 0.25, -0.75);
        this.sunAngleXZ = createVector(this.sunAngle.x, this.sunAngle.z);

        this.debugVerts = [];
        this.createTerrain();

        // CITY CODE:
        this.numCities = 6; // number of city clusters generated 
        this.cities = this._generateCities(this.numCities);
        this._randomlyRotateCities();

        // For each city, pre-build a small 3×3 cluster of offsets + random height
        for (let city of this.cities) {
            city.clusterPositions = [];
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    // Randomly make some cubes stack n levels high 
                    let h = floor(random(0, MAX_CITY_STACKS));
                    city.clusterPositions.push({ i: di, j: dj, h: h });
                }
            }
            // Each city cluster has a randomized base color 
            city.red = random(100, 255);
            city.green = random(100, 255);
            city.blue = random(100, 255);
        }
    }

    update() {
        let angle = 360 / (60 * this.orbitTime);
        this.sunAngleXZ.rotate(angle);
        this.sunAngle = createVector(
            this.sunAngleXZ.x,
            this.sunAngle.y,
            this.sunAngleXZ.y
        );
    }
    _generateCities(n) {

        // Pick N city centers on the sphere

        let cities = [];

        // Minimum great circle separation
        const MIN_SPH_DIST = PI / 6;
        // Minimum longitude difference
        const MIN_LON_DIST = PI / 6;

        while (cities.length < n) {
            // Sample a uniform point on the sphere:
            let u = random(-1, 1);
            let phi = acos(u);
            let theta = random(0, TWO_PI);

            // Convert (phi, theta) to Cartesian on radius=this.rad:
            let x = this.rad * sin(phi) * cos(theta);
            let y = this.rad * u;        // because cos(phi) = u
            let z = this.rad * sin(phi) * sin(theta);
            let candPos = createVector(x, y, z);

            // Compute candidate’s longitude in [0, TWO_PI):
            let lon = atan2(z, x);
            if (lon < 0) lon += TWO_PI;

            // Check against each other city already accepted:
            let ok = true;
            for (let other of cities) {
                // Great-circle distance:
                let dotProd = candPos
                    .copy()
                    .normalize()
                    .dot(other.pos.copy().normalize());
                // clamp to [-1, 1] to avoid floating-point errors:
                dotProd = constrain(dotProd, -1, 1);

                let sphDist = acos(dotProd);
                if (sphDist < MIN_SPH_DIST) {
                    ok = false;
                    break;
                }

                // Longitude-difference check:
                let otherLon = atan2(other.pos.z, other.pos.x);
                if (otherLon < 0) otherLon += TWO_PI;

                let dLon = abs(lon - otherLon);
                dLon = min(dLon, TWO_PI - dLon);
                if (dLon < MIN_LON_DIST) {
                    ok = false;
                    break;
                }
            }

            // If both tests passed accept it:
            if (ok) {
                cities.push({
                    pos: candPos,
                    label: `City ${cities.length + 1}`
                });
            }
            // Otherwise reject and loop again
        }

        return cities;
    }

    _randomlyRotateCities() {
        let yaw = random(0, TWO_PI);
        let pitch = random(0, PI / 2);

        let cy = cos(yaw), sy = sin(yaw);
        let cp = cos(pitch), sp = sin(pitch);

        for (let city of this.cities) {
            let vx = city.pos.x;
            let vy = city.pos.y;
            let vz = city.pos.z;

            // Rotate around Y‐axis by yaw
            let x1 = vx * cy + vz * sy;
            let y1 = vy;
            let z1 = -vx * sy + vz * cy;

            // Then rotate around X‐axis by pitch
            let x2 = x1;
            let y2 = y1 * cp - z1 * sp;
            let z2 = y1 * sp + z1 * cp;

            city.pos.set(x2, y2, z2);
        }
    }

    _drawCityClusters() {
        const worldUp = createVector(0, 1, 0);
        for (let city of this.cities) {
            let n = city.pos.copy().normalize();
            let up = worldUp.copy();
            if (abs(n.dot(up)) > 0.99) {
                up = createVector(1, 0, 0);
            }
            let t = up.cross(n).normalize();
            let b = n.cross(t).normalize();

            for (let offset of city.clusterPositions) {
                let di = offset.i, dj = offset.j, h = offset.h;
                let s = CITY_CUBE_SIZE;
                let radialDistance = this.rad + h * s + (s / 2);

                let worldPos = p5.Vector
                    .mult(n, radialDistance)
                    .add(p5.Vector.mult(t, di * s))
                    .add(p5.Vector.mult(b, dj * s));

                push();
                translate(worldPos.x, worldPos.y, worldPos.z);
                let axis = createVector(0, 1, 0).cross(n);
                let dotA = createVector(0, 1, 0).dot(n);
                let angle = acos(constrain(dotA, -1, 1));
                if (axis.mag() > 0.001) rotate(angle, axis);

                fill(city.red, city.green, city.blue);
                noStroke();
                box(s);
                pop();
            }
        }
    }

    // Draw each city’s 3×3 block of little cubes sticking out on the sphere
    _drawCityClusters() {
        const worldUp = createVector(0, 1, 0);

        for (let city of this.cities) {
            //  Compute the unit normal at the surface point:
            let n = city.pos.copy().normalize();

            //  Build two tangent vectors (t, b) so that {t, b, n} is orthonormal:
            let up = worldUp.copy();
            if (abs(n.dot(up)) > 0.99) {
                // If n is nearly parallel to worldUp, pick X-axis as fallback up
                up = createVector(1, 0, 0);
            }
            let t = up.cross(n).normalize();
            let b = n.cross(t).normalize();

            //  For each offset (di, dj, h) in that city’s 3×3 cluster:
            for (let offset of city.clusterPositions) {
                let di = offset.i;
                let dj = offset.j;
                let h = offset.h;       // stack height: 0 or 1


                let s = CITY_CUBE_SIZE;

                // The center of each cube needs to be “rad + h*s + s/2” out along n:
                let radialDistance = this.rad + h * s + (s / 2);

                // Build worldPos = n*radialDistance + t*(di*s) + b*(dj*s):
                let worldPos = p5.Vector
                    .mult(n, radialDistance)
                    .add(p5.Vector.mult(t, di * s))
                    .add(p5.Vector.mult(b, dj * s));

                // Draw one small cube at worldPos, rotated so (0,1,0) to n:
                push();
                translate(worldPos.x, worldPos.y, worldPos.z);

                //  Rotate so that local‐up (0,1,0) to n
                let axis = createVector(0, 1, 0).cross(n);
                let dotA = createVector(0, 1, 0).dot(n);
                let angle = acos(constrain(dotA, -1, 1));
                if (axis.mag() > 0.001) {
                    rotate(angle, axis);
                }

                //  Draw the filled cube
                fill(city.red, city.green, city.blue);
                noStroke();
                box(s);

                stroke(0);        // black stroke
                noFill();         // just edges
                //a tiny scale up prevents z‐fighting so the black edges sit on top
                box(s * 1.01);

                pop();
            }
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
        for (let vert of this.debugVerts) {
            this.terrain.vertices.push(vert);
        }
        for (let face of ICOSPHERE_FACES) {
            this.subdivide(face, [], 0, TERRAIN_FIDELITY);
        }

        // Vary the terrain vertices using Perlin noise
        this.varyTerrain();

        // This makes the lighting work
        this.terrain.computeNormals(FLAT);
    }

    varyTerrain() {
        let noiseScale = 0.2;
        for (let i = 0; i < this.terrain.vertices.length; i++) {
            let vert = this.terrain.vertices[i];
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
        freeGeometry(this.terrain);
    }

    subdivide(face, faces, level, depth) {
        // Base case
        if (level == depth) {
            for (let f of faces) {
                this.terrain.faces.push(f);
            }
            return;
        }

        // Get face vertices
        let v1i = face[0];
        let v2i = face[1];
        let v3i = face[2];
        let v1 = this.terrain.vertices[v1i];
        let v2 = this.terrain.vertices[v2i];
        let v3 = this.terrain.vertices[v3i];

        // Create new slerped vertices, subdividing original face
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
        for (let f of newFaces) {
            this.subdivide(f, newFaces, level + 1, depth);
        }
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
        this._drawCityClusters();
        // this.drawDebugVerts();
        this.drawStar();
    }
}
