// util.js - Useful functions
// Author(s): Lyle Watkins, Andy Newton
// Last Updated: 6/11/2025

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

/**
 * @typedef {Object} p5.Vector
 * @property {number} x
 * @property {number} y
 * @property {number} z 
 * @property {function(): string} toString
 * @property {function(): number} mag
 * @property {function(): number} magSq
 * @property {function(p5.Vector): number} dot
 * @property {function(p5.Vector): number} dist
 * @property {function()} normalize 
 * @property {function(number)} limit 
 * @property {function(number)} setMag 
 * @property {function(): number} heading  
 * @property {function(number)} setHeading   
 * @property {function(p5.Vector): number} angleBetween
 * @property {function(p5.Vector, number): number} lerp
 * @property {function(p5.Vector, number): number} slerp
 * @property {function(p5.Vector)} reflect
 * @property {function(): Array.<number>} array
 * @property {function(p5.Vector): boolean} equals
 */

/**
 * @typedef {Object} SphericalCoordinate
 * @property {number} r
 * @property {number} polar
 * @property {number} azimuth
 */

/**
 * Convert a vector
 * @param {p5.Vector} v 
 * @return {SphericalCoordinate} 
 */
function cartesianToSpherical(v) {
	let r = v.mag()
	let polar = r != 0 ? Math.acos(v.z / r) : 0
	let azimuth = Math.atan2(v.y, v.x)
	return {r: r, polar: polar, azimuth: azimuth}
}

function sphericalToCartesian(s) {
	return createVector(s.r * Math.sin(s.polar) * Math.cos(s.azimuth), s.r * Math.sin(s.polar) * Math.sin(s.azimuth), s.r * Math.cos(s.polar))
}

function axisAngleRotation(v, e, theta) {
	let sinT = Math.sin(theta)
	let cosT = Math.cos(theta)
	let rc1 = e.copy().cross(v)
	let rc2 = e.copy().cross(rc1)
	return createVector(v.x + sinT * rc1.x + (1 - cosT) * rc2.x, v.y + sinT * rc1.y + (1 - cosT) * rc2.y, v.z + sinT * rc1.z + (1 - cosT) * rc2.z)
}

function screenToRay(camera, [screenX, screenY]) {
	let fovy = camera.cameraFOV
	let aspect = camera.aspectRatio
	let fovx = 2 * Math.atan(Math.tan(fovy / 2.0) * aspect)
	
	let forward = createVector(camera.centerX - camera.eyeX, camera.centerY - camera.eyeY, camera.centerZ - camera.eyeZ);
	forward.normalize()

	let xAngleDiff = -(screenX / (width / 2) - 1.0) * fovx / 2
	let yAngleDiff = (screenY / (height / 2) - 1.0) * fovy / 2

	let up = createVector(camera.upX, camera.upY, camera.upZ)
	let left = forward.cross(up)

	let rotX = axisAngleRotation(forward, up, xAngleDiff)
	let rotY = axisAngleRotation(rotX, left, yAngleDiff)
	return rotY;
}

// reference: https://kylehalladay.com/blog/tutorial/math/2013/12/24/Ray-Sphere-Intersection.html
// also reference: https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection.html
/**
 * 
 * @param {p5.Vector} origin 
 * @param {p5.Vector} rayDir 
 * @param {p5.Vector} center 
 * @param {number} radius 
 * @returns {p5.Vector?}
 */
function raySphereIntersect(origin, rayDir, center, radius) {
	let l = createVector(center.x - origin.x, center.y - origin.y, center.z - origin.z);
	let tc = l.dot(rayDir)
	if (tc < 0) return null

	let d2 = l.magSq() - (tc * tc) 
	let radius2 = radius * radius
	if (d2 > radius2) return null

	let t1c = Math.sqrt(radius2 - d2);
	let t1 = tc - t1c;
	let t2 = tc + t1c;

	if (t1 > t2) [t1, t2] = [t2, t1];
	if (t1 < 0) {
		t1 = t2
		if (t1 < 0) return null;
	}

	return createVector(origin.x + rayDir.x * t1, origin.y + rayDir.y * t1, origin.z + rayDir.z * t1)
}
