/**
 * Placeholder for a fully deterministic random system.
 * Intended to support reproducible seeded randomness.
 * @todo Implement a custom PRNG or controlled seeding strategy.
 */
function deterministicRandom(){
    //randomSeed(SEED);
    // TODO
}

/**
 * Returns a pseudo-random integer between `min` (inclusive) and `max` (exclusive).
 * Uses `p5.js`'s `random()` under the hood.
 * @param {number} max - Upper bound (exclusive).
 * @param {number} [min=0] - Lower bound (inclusive).
 * @returns {number} A random integer in the range [min, max).
 */
function myRandom(max, min = 0){
    const r = Math.floor(random() * (max - min)) + min;
    return r;
}

/**
 * Returns true or false based on a random coin flip, compared against a pass threshold.
 * Automatically resets the random seed for consistent behavior if SEED is defined.
 * @param {number} [pass=0.5] - The probability threshold (between 0 and 1). Values above this will return false.
 * @returns {boolean} True if random result is greater than `pass`, else false.
 */
function coinflip(pass = 0.5){
    randomSeed(SEED);
    return random() > pass;
}

/**
 * Returns a random element from the provided array.
 * @param {Array} arr - Array to select from.
 * @returns {*} A random element from the array.
 */
function randomFromArray(arr){
    const len = arr.length;
    const i = myRandom(len);

    return arr[i]
}

function randomFromObject(obj){
    const keys = Object.keys(obj);
    const pick = randomFromArray(keys);

    return obj[pick];
}