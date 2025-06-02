let idc = 0

class Person {
    constructor(polar, azimuth) {
        this.polar = polar
        this.azimuth = azimuth
        this.id = idc++
    }

    draw(planet) {
        // Project model position onto planet surface

        // TODO: replace planet.rad with some kind of height data (don't know how yet) 
        let x = planet.rad * Math.sin(this.polar) * Math.cos(this.azimuth)
        let y = planet.rad * Math.sin(this.polar) * Math.sin(this.azimuth)
        let z = planet.rad * Math.cos(this.polar)

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

        this.drawInternal();
        pop();

        angleMode(oldmode)
    }

    drawInternal() {
        push();
        translate(0, 0, 2);
        ellipsoid(1, 1, 2);
        pop();

        push();
        translate(0, 0, 4);
        sphere(1.5);
        pop();
    }

    update() {
        let pd = noise(millis() / 10000.0, this.id * 10.0 + 50.0) * 2.0 - 1.0
        let ad = noise(millis() / 10000.0, this.id * 10.0) * 2.0 - 1.0

        let l = Math.sqrt(pd * pd + ad * ad)

        this.polar += (pd / l) * PEOPLE_SPEED
        this.azimuth += (ad / l) * PEOPLE_SPEED
    }
}

class PeopleManager {
    constructor() {
        this.people = []

        for (let i = 0 ; i < 100 ; i++) {
            this.people.push(new Person(random() * PI * 2, random() * PI * 2))
        }
    }

    update() {
        for (let person of this.people) {
            person.update()
        }
    }
    
    draw(planet) {
        for (let person of this.people) {
            person.draw(planet)
        }
    }
}