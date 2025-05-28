// sketch.js - Uses p5.js in instance mode
// Author(s): Lyle Watkins
// Last Updated: 5/22/2025

let canvas_container;
let cam;
let prevCamPos;
let camPos;
let camDist;
let zoom = 0;
let planet;

function resizeScreen(p) {
    let container_rect = canvas_container[0].getBoundingClientRect();
    let container_width = container_rect.width;
    let container_height = container_rect.height;

    center_horz = container_width / 2;
    center_vert = container_height / 2;
    p.resizeCanvas(container_width, container_height);
}

let sketch = function (p) {
    p.setup = function () {
        // Set up canvas
        canvas_container = $("#canvas-container");
        let canvas = p.createCanvas(canvas_container.width(), canvas_container.height(), p.WEBGL);
        canvas.parent("canvas-container");
        // Enable full screen
        $(window).resize(function () {
            resizeScreen(p);
        });

        p.frameRate(60);
        p.angleMode(p.DEGREES);
        //p.debugMode();
        cam = p.createCamera();
        p.setCamera(cam);
        planet = new Planet(p);
    };

    p.draw = function () {
        p.orbitControl();
        cam.lookAt(0, 0, 0); // Disables movement with the right-click drag
        p.background(0);
        p.noStroke();
        planet.update(p);
        planet.draw(p);

        // Update camera
        // There's kind of a jumping effect, but I don't think its too big a deal
        camPos = p.createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
        camDist = camPos.mag();
        if (camDist < MAX_CAMERA_DISTANCE && camDist > MIN_CAMERA_DISTANCE) prevCamPos = camPos;
        else cam.setPosition(prevCamPos.x, prevCamPos.y, prevCamPos.z);

        //p.stroke(255); // Debug stroke
    };

    p.mouseWheel = function (event) {
        // The default Z limits of orbit control are 80-8000, so I changed this above
        // I mapped the zoom number onto 1-100 so higher numbers would mean more zoom
        zoom = p.map(camDist, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE, 100, 1);
        zoom = p.constrain(zoom, 1, 100);
        //p.print(zoom);
    }
};

let myp5 = new p5(sketch);