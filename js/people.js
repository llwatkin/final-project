let idc = 0

class Person {
    constructor(polar, azimuth, startingCity) {
        this.polar = polar
        this.azimuth = azimuth
        this.id = idc++
        
        this.startingCity = startingCity
        this.red = true
        
        this.activeDirection = {polar: random(-Math.PI, Math.PI), azimuth: random(-Math.PI, Math.PI)}
        this.changeDirectionTimer = millis() + random(PEOPLE_MIN_MOVE_DIR_TIMER, PEOPLE_MAX_MOVE_DIR_TIMER)

        this.positions = []
    }

    draw(planet) {
        // Project model position onto planet surface

        let pos = sphericalToCartesian({r:planet.rad,polar:this.polar,azimuth:this.azimuth})
        let r = Math.max(planet.rad,planet.terrain.calculateHeight(pos))
        pos = sphericalToCartesian({r:r,polar:this.polar,azimuth:this.azimuth})
        let [x,y,z] = [pos.x,pos.y,pos.z]

        push();
        translate(x, y, z);

        let vl = Math.sqrt(x * x + y * y + z * z)
        let ux = x / vl
        let uy = y / vl
        let uz = z / vl

        let oldmode = angleMode()
        angleMode(RADIANS)

        let angle1 = Math.atan2(uy, ux)
        let angle2 = -Math.asin(uz)
        rotate(angle1, [0,0,1])
        rotate(angle2 + HALF_PI, [0,1,0])
        angleMode(oldmode)

        ambientLight(50);
        directionalLight(color(255), planet.sunAngle); // Sun

        this.drawInternal();
        pop();

    }

    drawInternal() {
        if (this.red) {
            fill(255,0,0)
        } else {
            fill(255)
        }
        push();
        translate(0, 0, 2);
        ellipsoid(1, 1, 2);
        pop();

        push();
        translate(0, 0, 4);
        sphere(1.5);
        pop();
    }

    update(planet) {
        if (this.changeDirectionTimer < millis()) {
            this.activeDirection = {polar: this.activeDirection.polar + random(-Math.PI / 8, Math.PI / 8), azimuth: this.activeDirection.azimuth + random(-Math.PI / 8, Math.PI / 8)}
            this.changeDirectionTimer = millis() + random(PEOPLE_MIN_MOVE_DIR_TIMER, PEOPLE_MAX_MOVE_DIR_TIMER)    
        }

        let pos = sphericalToCartesian({r:planet.rad, polar:this.polar, azimuth:this.azimuth})

        let h = planet.terrain.calculateHeight(pos)
        if (h < planet.rad - 0.1) { // water
            this.red = true
            this.activeDirection = {polar: -this.activeDirection.polar, azimuth: -this.activeDirection.azimuth}
            this.changeDirectionTimer = millis() + random(PEOPLE_MIN_MOVE_DIR_TIMER, PEOPLE_MAX_MOVE_DIR_TIMER)    
        } else {
            this.red = false
        }

        let l = Math.sqrt(this.activeDirection.polar * this.activeDirection.polar + this.activeDirection.azimuth * this.activeDirection.azimuth)

        this.polar += (this.activeDirection.polar / l) * PEOPLE_SPEED
        this.azimuth += (this.activeDirection.azimuth / l) * PEOPLE_SPEED

        this.positions.push([this.polar, this.azimuth])
        if (this.positions.length > 5) {
            this.positions.shift()
        }

        if (this.positions.length > 5) {
            if (Math.abs(this.positions[0][0] - this.positions[this.positions.length - 1][0] + this.positions[0][1] - this.positions[this.positions.length - 1][1]) < 0.01) {
                this.startingCity = random(planet.cities)
                let sp = cartesianToSpherical(this.startingCity.pos)
                this.polar = sp.polar
                this.azimuth = sp.azimuth
                       
                this.activeDirection = {polar: this.activeDirection.polar + random(-Math.PI / 8, Math.PI / 8), azimuth: this.activeDirection.azimuth + random(-Math.PI / 8, Math.PI / 8)}
                this.changeDirectionTimer = millis() + random(PEOPLE_MIN_MOVE_DIR_TIMER, PEOPLE_MAX_MOVE_DIR_TIMER)                       
            }
        }
    }
}

class PeopleManager {
    constructor(planet) {
        this.people = []

        for (let i = 0 ; i < NUM_PEOPLE ; i++) {
            let city = random(planet.cities)
            
            let s = cartesianToSpherical(city.pos)
            this.people.push(new Person(s.polar, s.azimuth, city))
        }
    }

    update(planet) {
        for (let person of this.people) {
            person.update(planet)
        }
    }
    
    draw(planet) {
        for (let person of this.people) {
            person.draw(planet)
        }
    }
}