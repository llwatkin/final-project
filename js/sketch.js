// sketch.js
// Author(s): Lyle Watkins
// Last Updated: 5/31/2025

let canvasContainer;
let seedDisplay;
let seedInput;
let cam;
let prevCamPos;
let camPos;
let camDist;
let zoom = 0;
let planet;

let testPeople;

function resizeScreen() {
    let container_rect = canvasContainer[0].getBoundingClientRect();
    let container_width = container_rect.width;
    let container_height = container_rect.height;

    center_horz = container_width / 2;
    center_vert = container_height / 2;
    resizeCanvas(container_width, container_height);
}

function setup() {
    // Set up canvas
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height(), WEBGL);
    canvas.parent("canvas-container");
    // Enable full screen
    $(window).resize(function () {
        resizeScreen();
    });

    // Set seed and corresponding HTML elements
    let seed = round(random(10000));
    noiseSeed(seed);
    seedDisplay = document.getElementById("seed-display");
    seedInput = document.getElementById("seed-input");
    seedDisplay.textContent = "Seed: " + str(seed);
    seedInput.value = seed;

    frameRate(60);
    angleMode(DEGREES);
    //debugMode();
    cam = createCamera();
    setCamera(cam);
    generate();

    testPeople = new PeopleManager()
}

function generate() {
    // Update seed and display
    let seed = seedInput.value;
    noiseSeed(seed);
    seedDisplay.textContent = "Seed: " + str(seed);

    // Create new planet
    if (planet) planet.clearTerrain();
    planet = new Planet();
}

function draw() {
    orbitControl();
    cam.lookAt(0, 0, 0); // Disables movement with the right-click drag
    background(0);
    noStroke();
    planet.update();
    planet.draw();

    testPeople.update()
    testPeople.draw(planet)

    // Update camera
    // There's kind of a jumping effect, but I don't think its too big a deal
    camPos = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
    camDist = camPos.mag();
    if (camDist < MAX_CAMERA_DISTANCE && camDist > MIN_CAMERA_DISTANCE) prevCamPos = camPos;
    else cam.setPosition(prevCamPos.x, prevCamPos.y, prevCamPos.z);

    stroke(255); // Debug stroke
}

function mouseWheel(event) {
    // The default Z limits of orbit control are 80-8000, so I changed this (new values in the config)
    // I mapped the zoom number onto 1-100 so higher numbers would mean more zoom (this doesn't do anything yet)
    zoom = map(camDist, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE, 100, 1);
    zoom = constrain(zoom, 1, 100);
    //console.log(zoom);
}
