// util.js - Useful functions
// Author: Lyle Watkins
// Last Updated: 5/29/2025

// Returns a new vector rotated around the X axis by some given degrees
function vectorRotateX(vector, angle) {
	let new_y = vector.y * cos(angle) - vector.z * sin(angle);
	let new_z = vector.y * sin(angle) + vector.z * cos(angle);
	return createVector(vector.x, new_y, new_z);
}

// Returns a new vector rotated around the Y axis by some given degrees
function vectorRotateY(vector, angle) {
	let new_x = vector.x * cos(angle) + vector.z * sin(angle);
	let new_z = -vector.x * sin(angle) + vector.z * cos(angle);
	return createVector(new_x, vector.y, new_z);
}

// Returns a new vector rotated around both the X and Y axes by some given degree
function vectorRotateXY(vector, angle) {
	return vectorRotateX(vectorRotateY(vector, angle), angle);
}