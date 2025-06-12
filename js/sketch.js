// sketch.js
// Author(s): Lyle Watkins, Raven Cruz, Andy Newton, Evelyn Marino
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
let starbox;

let cityIndex = -1;   // -1 = planet view

let inTour = false;
let cityTourIndex = 0;

function resizeScreen() {
    let container_rect = canvasContainer[0].getBoundingClientRect();
    let container_width = container_rect.width;
    let container_height = container_rect.height;

    center_horz = container_width / 2;
    center_vert = container_height / 2;
    resizeCanvas(container_width, container_height);
}

function preload() {
    myFont = loadFont('assets/Roboto-Regular.ttf');

    LORE_GLOBS.JSON = loadAllJSON();
    LORE_GLOBS.LORE_DATA = LORE_GLOBS.JSON["loreKeys"];
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

    // text box
    infoPanel = select('#info-panel');

    // Set seed and corresponding HTML elements
    let seed = round(random(10000));
    noiseSeed(seed);
    randomSeed(seed);
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
    starbox = new Stars();

    initLore();

    const tourBtn = select('#tour-btn');
    const prevBtn = select('#prev-btn');
    const nextBtn = select('#next-btn');

    tourBtn.mousePressed(() => {
        inTour = !inTour;
        panelUpdated = !panelUpdated;
        if (inTour) {
            // start at the first city
            cityTourIndex = 0;
            selectedCity = planet.cities[0];
            tourBtn.html('Exit Tour');
            prevBtn.show();
            nextBtn.show();
        } else {
            selectedCity = null;
            tourBtn.html('Tour Planet');
            prevBtn.hide();
            nextBtn.hide();
        }
    });

    prevBtn.mousePressed(() => {
        cityTourIndex = (cityTourIndex - 1 + planet.cities.length) % planet.cities.length;
        selectedCity = planet.cities[cityTourIndex];
        panelUpdated = false;
    });
    nextBtn.mousePressed(() => {
        cityTourIndex = (cityTourIndex + 1) % planet.cities.length;
        selectedCity = planet.cities[cityTourIndex];
        panelUpdated = false;
    });

    // hide the arrows until tour mode begins
    prevBtn.hide();
    nextBtn.hide();

    panelUpdated = false;
}

function generate() {
    // Update seed and display
    let seed = seedInput.value;
    noiseSeed(seed);
    randomSeed(seed);
    seedDisplay.textContent = "Seed: " + str(seed);

    SEED = seed;    // set global

    // Create new planet
    if (planet) planet.terrain.clearTerrain();
    planet = new Planet();

    initLore();
}

function draw() {
    clear();    // reset WebGL
    if (!inTour) {
        // PLANET VIEW
        background(0);
        orbitControl();
        cam.lookAt(0, 0, 0);

        planet.update();
        planet.draw();
        starbox.draw();
        stroke(255);

        // Update camera
        // There's kind of a jumping effect, but I don't think its too big a deal
        camPos = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
        camDist = camPos.mag();
        if (camDist < MAX_CAMERA_DISTANCE && camDist > MIN_CAMERA_DISTANCE) prevCamPos = camPos;
        else cam.setPosition(prevCamPos.x, prevCamPos.y, prevCamPos.z);

        if(!panelUpdated){
            updateInfoPanel("world", {attributes: ["name", "history", "world_powers"]});
            panelUpdated = true;
        }
    } else {
        //CITY CAROUSEL VIEW 
        background(0);
        orbitControl();
        cam.lookAt(0, 0, 0);
        perspective();
        scale(3);

        // Update camera
        // There's kind of a jumping effect, but I don't think its too big a deal
        camPos = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
        camDist = camPos.mag();
        if (camDist < MAX_CAMERA_DISTANCE && camDist > MIN_CAMERA_DISTANCE) prevCamPos = camPos;
        else cam.setPosition(prevCamPos.x, prevCamPos.y, prevCamPos.z);

        push();
        rotateX(-PI / 6);
        rotateY(PI / 4);


        translate(-CITY_CUBE_SIZE, 0, -CITY_CUBE_SIZE);

        for (let o of selectedCity.clusterPositions) {
            push();
            translate(o.i * CITY_CUBE_SIZE,
                -(o.h * CITY_CUBE_SIZE + CITY_CUBE_SIZE / 2),
                o.j * CITY_CUBE_SIZE);
            fill(selectedCity.red, selectedCity.green, selectedCity.blue);
            stroke(0);
            box(CITY_CUBE_SIZE);
            pop();
        }
        pop();

        if(!panelUpdated){
            let id = parseInt(selectedCity.label[selectedCity.label.length-1]);
            const country = getCountryByID(id);
            updateInfoPanel("country", {
                obj: country, 
                attributes: ["name", "government", "resource", "economy_strength"],
                process: [
                    {fn: printRelationships, params: country},
                    {fn: printWorry, params: country},
                ]
            });
            panelUpdated = true;
        }
    }
}

function drawIsometricCity(city) {
    background(0);
    noStroke();
    planet.update();
    planet.draw();
    starbox.draw();

    // zoom
    const Z = 3;
    ortho(-width / Z / 2, width / Z / 2, -height / Z / 2, height / Z / 2, -1000, 1000);

    // lighting so theres shading
    ambientLight(50);
    directionalLight(255, 255, 255, 0.5, -1, 0.5);


    push();
    rotateX(-PI / 6);
    rotateY(PI / 4);


    scale(2.5);

    //center cluster
    const s = CITY_CUBE_SIZE;
    translate(-s, 0, -s);

    //  draw each cube with box()
    for (let o of city.clusterPositions) {
        push();
        translate(o.i * s, -(o.h * s + s / 2), o.j * s);
        fill(city.red, city.green, city.blue);
        nostroke();
        box(s);
        pop();
    }
    pop();
}


function mouseWheel(event) {
    // The default Z limits of orbit control are 80-8000, so I changed this (new values in the config)
    // I mapped the zoom number onto 1-100 so higher numbers would mean more zoom (this doesn't do anything yet)
    zoom = map(camDist, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE, 100, 1);
    zoom = constrain(zoom, 1, 100);
    //console.log(zoom);
}

function initLore() {
    generateWorld(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES);

    console.log("world lore: ", LORE_GLOBS.WORLD_STATS);
    console.log("countries lore: ", LORE_GLOBS.COUNTRY_STATS);
}
function trySelectCity() {
    for (let i = 0; i < planet.cities.length; i++) {
        let c = planet.cities[i];
        let sx = screenX(c.pos.x, c.pos.y, c.pos.z);
        let sy = screenY(c.pos.x, c.pos.y, c.pos.z);
        if (dist(mouseX, mouseY, sx, sy) < CITY_CLICK_RADIUS) {
            cityIndex = i;
            return;
        }
    }
}

// level is world or country, details is an array of property names to be printed
function updateInfoPanel(level, details) {
    const loreBucket = LORE_GLOBS[`${level.toUpperCase()}_STATS`];
    if (loreBucket) {
        infoPanel.html(printLore(loreBucket, level, details));
    } else {
        infoPanel.html(`<p>No data loaded.</p>`);
    }
}
