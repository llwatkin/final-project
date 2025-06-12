// json_utils.js
// Author(s): Raven Cruz
// Last Updated: 6/11/2025
// helper functions for handling json files

/**
 * Map of choice gathering handlers referenced by JSON configuration files.
 * Each process returns dynamically calculated choices.
 * @type {Object<string, function>}
 */
const PROCESSES = {
    random_grid: (grid) => random_grid(grid)
}

/**
 * Map of special choice selection handlers for transforming data into 
 * human-readable text.
 * @type {Object<string, function>}
 */
const SPECIAL = {
    grid: (handling, data, choiceJSON) => cellToText(handling, data, choiceJSON)
}

/**
 * Loads and parses a JSON file from the given path.
 * @param {string} filePath - Full path to the JSON file.
 * @returns {Promise<Object|null>} Parsed JSON object, or null if fetch fails.
 */
//async function _loadJSON(filePath) {
//    try {
//        const response = await fetch(filePath);
//        if (!response.ok) {
//            throw new Error(`HTTP error! status: ${response.status}`);
//        }
//        const data = await response.json();
//        return data;
//    } catch (error) {
//        console.error("Could not load JSON: " + error);
//        return null;
//    }
//}

/**
 * Gets an array of choice strings for a given category, using control logic from the lore JSON schema.
 * May use attribute-based filters or dynamic processes.
 * @param {Object} data - The full lore data object (usually a section like `loreData.country`).
 * @param {string} cat - The category name to fetch choices from (e.g., "government", "currency").
 * @param {Object} self - The current country object, used for attribute filtering if required.
 * @returns {Promise<string[]>} Array of choices.
 */
function getChoices(data, cat, self){
    let choices = [];
    if(data[cat].choice_control){
        const controller = data[cat].choice_control;
        const choiceJSON = LORE_GLOBS.JSON[controller.json];

        if(controller.location){
            let attr_choices = getChoicesByAttribute(controller, self);
            for(const c in attr_choices){
                choices = choices.concat(choiceJSON[attr_choices[c]]); 
            }

        } else if(controller.process){
            const params = choiceJSON[choiceJSON.params];
            choices = PROCESSES[controller.process](params);
        }
    }
    else if(data[cat].choices){
        choices = data[cat].choices;  
    }
            
    return choices;
}


/**
 * Fetches the top-level lore keys JSON (e.g., _loreKeys.json).
 * @param {string} path - Directory path to fetch from.
 * @returns {Promise<Object>} Parsed JSON object containing lore key schema.
 */
//async function fetchLoreKeys(path) {
//    const response = await fetch(`${path}/_loreKeys.json`);
//	const json = await response.json();
//	return json;
//}

/**
 * Retrieves valid category choices based on a control attribute from either world or self.
 * @param {Object} controller - JSON control block with `location` and `attribute` fields.
 * @param {Object} self - The current country object, if needed.
 * @returns {Promise<string[]|undefined>} Array of attribute-based keys or undefined on error.
 */
function getChoicesByAttribute(controller, self) {
    let loc;
    if(controller.location === "world"){ loc = LORE_GLOBS.WORLD_STATS; }
    else if(controller.location === "self"){ loc = self; }
    else {
        console.error(`Unknown control location: ${controller.location}`)
        return;
    }

    return loc[`${controller.attribute}`]; 
}

/**
 * Randomly selects a grid cell from a grid definition and returns its cell ID string (e.g., "C4").
 * @param {Object} grid - A grid object with `row_vals` and `col_vals`.
 * @returns {Promise<string[]>} Array with a single grid cell string.
 */
function random_grid(grid) {
    // start by getting grid dims
    const w = grid.row_vals.length;
    const h = grid.col_vals.length;

    // choose a row val and a col val
    const [row, col] = [ myRandom(w), myRandom(h) ]

    return [
        `${grid.row_vals[row]}${grid.col_vals[col]}`
    ]
}

/**
 * Handles special transformation logic for a given choice control type (e.g., grid-to-text).
 * @param {Object} handling - Original field definition including `choice_control`.
 * @param {Object} data - Country or world object with actual values to transform.
 * @returns {Promise<string[]>} Array with a single transformed string.
 */
function specialHandler(handling, data){
    const choiceJSON = LORE_GLOBS.JSON[handling.choice_control.json];
    return SPECIAL[handling.choice_control.special](handling, data, choiceJSON);
}

/**
 * Converts a political compass grid cell (e.g. "C4") into descriptive text using external JSON data.
 * @param {Object} handling - The original field definition.
 * @param {Object} data - The country or world object containing grid cell data.
 * @param {Object} choiceJSON - Parsed JSON containing row and column descriptors.
 * @returns {<string[]>} Array with a single formatted text string (e.g., "Libertarian Rural").
 */
function cellToText(handling, data, choiceJSON) {
    const cell = data[handling.choice_control.attribute][0];
    const x = cell[1];
    const y = cell[0];

    const rowChoices = choiceJSON.rows[x];
    const colChoices = choiceJSON.cols[y];

    const row = rowChoices[myRandom(rowChoices.length)];
    const col = colChoices[myRandom(colChoices.length)];

    let text = `${col}`;
    if(text.length > 0) text += " "
    text += `${row}`

    return [text];
}

/**
 * Calculates the maximum possible distance between two points on a political grid.
 * Based on the outermost row/column values.
 * @param {string} json - Filename (no extension) of the grid definition JSON.
 * @returns {<number>} Maximum Euclidean distance in grid units.
 */
function getMaxGridDistance(json) {
    const gridJSON = LORE_GLOBS.JSON[json];
    const grid = gridJSON.grid;

    const maxRow = grid.row_vals.length - 1;
    const maxCol = grid.col_vals.length - 1;

    const topLeft = `${grid.row_vals[0]}${grid.col_vals[0]}`;
    const bottomRight = `${grid.row_vals[maxRow]}${grid.col_vals[maxCol]}`;

    return getGridDistance(topLeft, bottomRight);
}

/**
 * Computes the Euclidean distance between two grid cells, using letter-number codes (e.g. "A1", "H6").
 * @param {string} cell1 - First cell ID.
 * @param {string} cell2 - Second cell ID.
 * @returns {<number>} Euclidean distance between the two points.
 */
function getGridDistance(cell1, cell2) {
    const p1 = gridCellToCoords(cell1);
    const p2 = gridCellToCoords(cell2);

    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    return dist;
}

/**
 * Converts a grid cell (e.g., "D3") into {x, y} coordinates.
 * @param {string} cell - Grid cell code, in the form of a single letter followed by a number.
 * @returns {{x: number, y: number}} The (x, y) coordinate pair.
 */
function gridCellToCoords(cell){
    return {
        x: cell[0].toLowerCase().charCodeAt(0) - ('a'.charCodeAt(0) - 1),  // [A, H] --> [0, 8]
        y: parseInt(cell[1])              
    }
}

function loadAllJSON() {
    let result = {};
    for (let json of ALL_JSON) {
        try {
            result[json] = loadJSON(`${LORE_GLOBS.JSON_PATH}/${json}.json`);
            console.log(`Loaded ${json}.json`);
        } catch (e) {
            console.error(`Failed to load ${json}.json`, e);
        }
    }
    return result;
}
