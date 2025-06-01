// util.js - Useful functions
// Author(s): Lyle Watkins
// Last Updated: 5/31/2025

// Returns a new vector rotated around the X axis by some given degrees
function vectorRotateX(v, a) {
	let new_y = v.y * cos(a) - v.z * sin(a);
	let new_z = v.y * sin(a) + v.z * cos(a);
	return createVector(v.x, new_y, new_z);
}

// Returns a new vector rotated around the Y axis by some given degrees
function vectorRotateY(v, a) {
	let new_x = v.x * cos(a) + v.z * sin(a);
	let new_z = -v.x * sin(a) + v.z * cos(a);
	return createVector(new_x, v.y, new_z);
}

// Returns a new vector rotated around both the X and Y axes by some given degree
function vectorRotateXY(v, a) {
	return vectorRotateX(vectorRotateY(v, a), a);
}

// Returns whether or not the two input vectors, when rounded, are equal
function isRoundedVectorEqual(v1, v2) {
	if (round(v1.x) == round(v2.x) && round(v1.y) == round(v2.y) && round(v1.z) == round(v2.z)) return true;
	return false;
}