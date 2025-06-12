// config.js - Constants for the entire project
// Last Updated: 6/11/2025

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const PLANET_RADIUS = 100;
const PLANET_ORBIT_TIME = 120; // Seconds it takes to revolve around its sun

const MAX_CAMERA_DISTANCE = PLANET_RADIUS * 10;
const MIN_CAMERA_DISTANCE = PLANET_RADIUS * 2.2;
const SUN_DISTANCE = MAX_CAMERA_DISTANCE * 1.25;
const STARBOX_SIZE = 5000;

const GOLDEN_RATIO = 1.618;
const ICOSAHEDRON_FACES =
	[
		[0, 3, 10],
		[3, 0, 11],
		[0, 6, 11],
		[0, 5, 6],
		[0, 10, 5],
		[3, 4, 10],
		[10, 4, 9],
		[10, 9, 5],
		[9, 4, 2],
		[9, 2, 1],
		[9, 1, 5],
		[5, 1, 6],
		[6, 1, 8],
		[6, 8, 11],
		[1, 2, 8],
		[2, 7, 8],
		[2, 4, 7],
		[4, 3, 7],
		[7, 3, 11],
		[7, 11, 8]
	];
const TERRAIN_FIDELITY = 3; // Number of subdivisions per face of the icosahedron
const TERRAIN_NOISE_SCALE = 0.2;
const PEOPLE_NOISE_SCALE = 0.05;
const TEXTURE_NOISE_SCALE = 0.0025;
const TEXTURE_PIXEL_SIZE = 20;
const MIN_TERRAIN_MOD = 10;
const MAX_TERRAIN_MOD = 20;

const CITY_CUBE_SIZE = 5;
const MAX_CITY_STACKS = 3;

const PEOPLE_SPEED = 0.0005;

let SEED = -1;
const NUM_PEOPLE = 100;
const PEOPLE_MIN_MOVE_DIR_TIMER = 100;
const PEOPLE_MAX_MOVE_DIR_TIMER = 400;
const SELECTION_SPHERE_SIZE = 5;

const CITY_NOISE_SCALE = 9.0;
const CITY_DENSITY_THRESHOLD = 0.5;  
const NUM_CITIES = 8;