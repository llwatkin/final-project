// planet.js - Planet with a sun it orbits and city cube clusters
// Author(s): Lyle Watkins, Evelyn Marino
// Last Updated: 06/11/2025

class Planet {
    constructor() {
        // Maybe radius and orbit time can be randomized for more variety in output
        this.rad = PLANET_RADIUS;
        this.orbitTime = PLANET_ORBIT_TIME; // 2 minute orbit
        this.sunAngle = createVector(1, 0.25, -0.75);
        this.sunAngleXZ = createVector(this.sunAngle.x, this.sunAngle.z);

        // Generate random colors for sun, ocean, and terrain
        push();
        colorMode(HSB);
        this.sunColor = color(random(0, 60), 100, 100);
        this.oceanColor = color(random(180, 255), 50, 75);
        this.terrainColor = color(random(50, 150), 75, 75);
        pop();

        this.terrain = new Terrain(this.rad, this.terrainColor, this.oceanColor);
        // TODO if time: add a texture to the star

        // CITY CODE:
        this.numCities =  NUM_CITIES; // number of city clusters generated 
        this.cities = this._generateCities(this.numCities);
        this._randomlyRotateCities();

        for (let city of this.cities) {
            city.clusterPositions = [];
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    // stack n levels high 
                    let h = floor(random(0, MAX_CITY_STACKS));
                    city.clusterPositions.push({ i: di, j: dj, h: h });
                }
            }
            //random color  
            city.red = random(100, 255);
            city.green = random(100, 255);
            city.blue = random(100, 255);
        }

        this.people = new PeopleManager(this)
    }

    update() {
        let angle = 360 / (60 * this.orbitTime);
        this.sunAngleXZ.rotate(angle);
        this.sunAngle = createVector(
            this.sunAngleXZ.x,
            this.sunAngle.y,
            this.sunAngleXZ.y
        );

        this.people.update(this)

    }

    _generateCities(n) {

        // Pick N city centers on the sphere
        let cities = [];
        // Minimum great circle separation
        const MIN_SPH_DIST = PI / 6;
        // Minimum longitude difference
        const MIN_LON_DIST = PI / 6;

        while (cities.length < n) {
            // pick a uniform random spot on the sphere
            let u = random(-1, 1),
                phi = acos(u),
                theta = random(0, TWO_PI);
            let x = this.rad * sin(phi) * cos(theta),
                y = this.rad * u,
                z = this.rad * sin(phi) * sin(theta);
            let candPos = createVector(x, y, z);

            //sample the density noise at that point
            let density = noise(
                candPos.x * CITY_NOISE_SCALE,
                candPos.y * CITY_NOISE_SCALE,
                candPos.z * CITY_NOISE_SCALE
            );
            if (density < CITY_DENSITY_THRESHOLD) continue;  // too “empty”

            let lon = atan2(z, x);
            if (lon < 0) lon += TWO_PI;
            let ok = true;
            for (let other of cities) {
                // circle distance
                let dp = candPos.copy().normalize()
                    .dot(other.pos.copy().normalize());
                dp = constrain(dp, -1, 1);
                if (acos(dp) < MIN_SPH_DIST) { ok = false; break; }
                // longitude difference
                let oLon = atan2(other.pos.z, other.pos.x);
                if (oLon < 0) oLon += TWO_PI;
                let dlon = abs(lon - oLon);
                dlon = min(dlon, TWO_PI - dlon);
                if (dlon < MIN_LON_DIST) { ok = false; break; }
            }
            if (!ok) continue;

            // accept it
            cities.push({ pos: candPos, label: `City ${cities.length + 1}` });
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


            let x1 = vx * cy + vz * sy;
            let y1 = vy;
            let z1 = -vx * sy + vz * cy;


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
    //little cubes sticking out on the sphere
    _drawCityClusters() {
        const worldUp = createVector(0, 1, 0);

        for (let city of this.cities) {
            //  Compute the unit normal at the surface point:
            let n = city.pos.copy().normalize();

            let up = worldUp.copy();
            if (abs(n.dot(up)) > 0.99) {

                up = createVector(1, 0, 0);
            }
            let t = up.cross(n).normalize();
            let b = n.cross(t).normalize();

            for (let offset of city.clusterPositions) {
                let di = offset.i;
                let dj = offset.j;
                let h = offset.h;       // stack height: 0 or 1

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
                if (axis.mag() > 0.001) {
                    rotate(angle, axis);
                }

                //  filled cube
                fill(city.red, city.green, city.blue);
                noStroke();
                box(s);

                stroke(0);        // black 
                noFill();
                box(s * 1.01);

                pop();
            }
        }
    }

    drawPlanet() {
        push();
        noStroke();
        ambientLight(50);
        directionalLight(color(255), this.sunAngle); // Sun
        this.people.draw(this);
        this._drawCityClusters();
        fill(this.oceanColor);
        sphere(this.rad);
        this.terrain.draw();
        pop();

        let ray = screenToRay(cam, [mouseX, mouseY])
        // console.log(ray.toString())
        let intersection = raySphereIntersect(createVector(cam.eyeX, cam.eyeY, cam.eyeZ), ray, createVector(0, 0, 0), this.rad)
        if (intersection != null) {
            let sp = cartesianToSpherical(intersection)
            sp.r = this.terrain.calculateHeight(intersection)
            intersection = sphericalToCartesian(sp)

            // console.log(intersection)
            push()

            fill(255, 255, 0, 127)
            noStroke()
            translate(intersection.x, intersection.y, intersection.z)
            sphere(SELECTION_SPHERE_SIZE)
            pop()
        }
    }

    drawStar() {
        push();
        noStroke();
        let sunPos = p5.Vector.mult(this.sunAngle, -SUN_DISTANCE);
        translate(sunPos.x, sunPos.y, sunPos.z);
        fill(this.sunColor);
        sphere();
        pop();
    }

    draw() {
        this.drawPlanet();
        // this.drawDebugVerts();
        this.drawStar();
    }
}
