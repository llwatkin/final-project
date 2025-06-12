// sketch.js
// Author(s): Lyle Watkins, Raven Cruz
// Last Updated: 6/11/2025

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

function preload() {
  myFont = loadFont('../assets/Roboto-Regular.ttf');
}

async function setup() {
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

    SEED = seed;    // set global

    frameRate(60);
    angleMode(DEGREES);
    //debugMode();
    cam = createCamera();
    setCamera(cam);
    generate();

    testPeople = new PeopleManager()

    // text box
    overlay = createGraphics(width, height);
    overlay.textFont(myFont);
    overlay.textSize(16);
    overlay.noStroke();
    showTextBox = false;
}

async function generate() {
    // Update seed and display
    let seed = seedInput.value;
    noiseSeed(seed);
    seedDisplay.textContent = "Seed: " + str(seed);

    SEED = seed;    // set global

    // Create new planet
    if (planet) planet.terrain.clearTerrain();
    planet = new Planet();

    await initLore();
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

    // text box
    overlay.clear();

    if (showTextBox) {
        drawTextBox(overlay, mouseX, mouseY, 200, 100, "Clicked here!");
    }

    // Draw the overlay as a texture (HUD layer)
    resetMatrix();
    translate(-width / 2, -height / 2); // from WEBGL center to top-left
    image(overlay, 0, 0);
}

function mouseWheel(event) {
    // The default Z limits of orbit control are 80-8000, so I changed this (new values in the config)
    // I mapped the zoom number onto 1-100 so higher numbers would mean more zoom (this doesn't do anything yet)
    zoom = map(camDist, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE, 100, 1);
    zoom = constrain(zoom, 1, 100);
    //console.log(zoom);
}

async function initLore() {
    LORE_GLOBS.LORE_DATA = await fetchLoreKeys(LORE_GLOBS.JSON_PATH);
    await generateWorld(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES);

    console.log("world lore: ", LORE_GLOBS.WORLD_STATS);
    console.log("countries lore: ", LORE_GLOBS.COUNTRY_STATS);
}

function mousePressed() {
    showTextBox = !showTextBox;
}

function drawTextBox(gfx, x, y, w, h, txt) {
    gfx.fill(255);
    gfx.stroke(0);
    gfx.rect(x, y, w, h);

    gfx.fill(0);
    gfx.noStroke();
    gfx.textAlign(LEFT, TOP);

    let padding = 10;
    gfx.text(txt, x + padding, y + padding, w - 2 * padding, h - 2 * padding);
}
