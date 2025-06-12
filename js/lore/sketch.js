// ./js.lore.sketch.js
// demo scene for lore generation 

/**
 * Handles updating the number of countries when the button is clicked.
 * Adds or removes countries accordingly and re-renders the display.
 */
const updateNumCountriesButton = document.getElementById("num-countries-button");
updateNumCountriesButton.addEventListener('click', function() {
    const oldNum = LORE_GLOBS.NUM_COUNTRIES;
    LORE_GLOBS.NUM_COUNTRIES = parseInt(document.getElementById("num-countries").value);

    if(oldNum < LORE_GLOBS.NUM_COUNTRIES){
        genMultipleCountries(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES, oldNum);
        printWorld();
        printCountries();
    } else if (oldNum > LORE_GLOBS.NUM_COUNTRIES){
        trimCountries(oldNum - LORE_GLOBS.NUM_COUNTRIES);
        printWorld();
        printCountries();
    }
});

/**
 * Key event listener to trigger lore regeneration:
 * - "r" resets country-level data and regenerates countries using a new seed.
 * - "w" resets and regenerates the entire world including global stats.
 */
document.addEventListener('keydown', (e) => {
	if(e.key.toLowerCase() === "r"){
        SEED = random() * 1000;
        resetCountries();
        genMultipleCountries(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES);

        document.getElementById(`country-stats`).innerHTML = "";
        document.getElementById(`world-stats`).innerHTML = "";
        printWorld();
        printCountries();
    }
    if(e.key.toLowerCase() === "w"){
        SEED = random() * 1000;
        initWorldLore(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES);
        printWorld();
	}
});

function preload() {
    LORE_GLOBS.JSON = loadAllJSON();
    LORE_GLOBS.LORE_DATA = LORE_GLOBS.JSON["loreKeys"];
    console.log(LORE_GLOBS)
}

/**
 * Initializes the sketch. Fetches lore key data and generates the world.
 * This function is called at startup.
 */
function setup() {
    initWorldLore(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES)
}

/**
 * Initializes full world generation including global stats and countries.
 * @param {Object} loreData - The parsed lore schema.
 * @param {number} num - Number of countries to generate.
 */
function initWorldLore(loreData, num){
    generateWorld(loreData, num);

    printWorld();
    printCountries();
}

/**
 * Clears and renders the current global stats to the DOM.
 */
function printWorld(){
    document.getElementById(`world-stats`).innerHTML = "";
    printLore(LORE_GLOBS.WORLD_STATS, "world");
}

/**
 * Clears and renders all current countries to the DOM.
 */
function printCountries(){
    document.getElementById(`country-stats`).innerHTML = "";
    for(let country in LORE_GLOBS.COUNTRY_STATS){
        printLore(LORE_GLOBS.COUNTRY_STATS[country], "country")
    }
}

