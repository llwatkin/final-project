// json_utils.js
// Author(s): Raven Cruz
// Last Updated: 6/1/2025
// helper functions for handling json files

// holds references to processes defined in json file(s)
const PROCESSES = {
    random_grid: (grid) => random_grid(grid)
}

// special choice pickers
const SPECIAL = {
    grid: (handling, data, choiceJSON) => cellToText(handling, data, choiceJSON)
}

// generic json getter
async function _loadJSON(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Could not load JSON: " + error);
        return null;
    }
}

// loads choices from specified json
async function getChoices(data, cat, self){
    let choices = [];
    if(data[cat].choice_control){
        const controller = data[cat].choice_control;
        const choiceJSON = await _loadJSON(`${LORE_GLOBS.JSON_PATH}/${controller.json}.json`);

        if(controller.location){
            let attr_choices = await getChoicesByAttribute(controller, self);
            for(const c in attr_choices){
                choices = choices.concat(choiceJSON[attr_choices[c]]); 
            }

        } else if(controller.process){
            const params = choiceJSON[choiceJSON.params];
            choices = await PROCESSES[controller.process](params);
        }
    }
    else if(data[cat].choices){
        choices = data[cat].choices;  
    }
            
    return choices;
}

// gets lore key json
async function fetchLoreKeys(path) {
    const response = await fetch(`${path}/_loreKeys.json`);
	const json = await response.json();
	return json;
}

async function getChoicesByAttribute(controller, self) {
    let loc;
    if(controller.location === "world"){ loc = LORE_GLOBS.WORLD_STATS; }
    else if(controller.location === "self"){ loc = self; }
    else {
        console.error(`Unknown control location: ${controller.location}`)
        return;
    }

    return loc[`${controller.attribute}`]; 
}

async function random_grid(grid) {
    // start by getting grid dims
    const w = grid.row_vals.length;
    const h = grid.col_vals.length;

    // choose a row val and a col val
    const [row, col] = [
        Math.floor(Math.random() * w),
        Math.floor(Math.random() * h),
    ]

    return [
        `${grid.row_vals[row]}${grid.col_vals[col]}`
    ]
}

async function specialHandler(handling, data){
    const choiceJSON = await _loadJSON(`${LORE_GLOBS.JSON_PATH}/${handling.choice_control.json}.json`);
    return await SPECIAL[handling.choice_control.special](handling, data, choiceJSON);
}

async function cellToText(handling, data, choiceJSON) {
    const cell = data[handling.choice_control.attribute][0];
    const x = cell[1];
    const y = cell[0];

    const rowChoices = choiceJSON.rows[x];
    const colChoices = choiceJSON.cols[y];

    const row = rowChoices[Math.floor(Math.random() * rowChoices.length)];
    const col = colChoices[Math.floor(Math.random() * colChoices.length)];

    return [`${col} ${row}`];
}

// find the distance between the topleftmost and bottomrightmost 
//      cells in the grid defined in the given json
async function getMaxGridDistance(json) {
    const gridJSON = await _loadJSON(`${LORE_GLOBS.JSON_PATH}/${json}.json`);
    const grid = gridJSON.grid;

    const maxRow = grid.row_vals.length - 1;
    const maxCol = grid.col_vals.length - 1;

    const topLeft = `${grid.row_vals[0]}${grid.col_vals[0]}`;
    const bottomRight = `${grid.row_vals[maxRow]}${grid.col_vals[maxCol]}`;

    return await getGridDistance(topLeft, bottomRight);
}

// convert political_compass cells to euclidian coordinates 
//  and get the distance bewteen the cells
async function getGridDistance(cell1, cell2) {
    const p1 = {
        x: cell1[0].toLowerCase().charCodeAt(0) - ('a'.charCodeAt(0) - 1),  // [A, H] --> [0, 8]
        y: parseInt(cell1[1])              
    }
    const p2 = {
        x: cell2[0].toLowerCase().charCodeAt(0) - ('a'.charCodeAt(0) - 1),  // [A, H] --> [0, 8]
        y: parseInt(cell2[1])
    }

    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    return dist;
}