// lore_globals.js
// Author(s): Raven Cruz
// Last Updated: 6/11/2025

// TODO: add other json files here to use in .js references to json files
const JSON_PATH = "./json";
const ALL_JSON = [
    "loreKeys", "economy", "government", "history_grammars", "name", 
    "political_compass", "worry"
]

/**
 * Global configuration and data containers for procedural lore generation.
 * @namespace
 * @property {string} JSON_PATH - Relative path to the directory containing JSON schema files.
 * @property {string} HISTORY_GRAMS - Filename (without extension) of the history grammar JSON file.
 * @property {number} NUM_COUNTRIES - Default number of countries to generate.
 * @property {Object} LORE_DATA - Holds the raw lore schema definitions loaded from JSON.
 * @property {Object} WORLD_STATS - Stores high-level, world-wide generated stats (e.g. powers, resource rankings).
 * @property {Object<string, Object>} COUNTRY_STATS - Dictionary mapping country names to their generated country objects.
 */
let LORE_GLOBS = {
    JSON_PATH: JSON_PATH,
    HISTORY_GRAMS: "history_grammars", // name of history json file
    JSON: {},
    NUM_COUNTRIES: NUM_CITIES,
    LORE_DATA: {},
    WORLD_STATS: {},
    COUNTRY_STATS: {},
}
