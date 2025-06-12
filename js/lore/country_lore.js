
/**
 * Generates lore for multiple countries, including any stats defined in loreData, 
 * thier history, and global relationships.
 * @param {Object} loreData - The base lore schema to use for generation.
 * @param {number|string} num - Total number of countries to generate.
 * @param {number|string} [from=0] - Index to start generation from.
 */
function genMultipleCountries(loreData, num, from = 0) {
    num = parseInt(num);
    from = parseInt(from);

    // generate countries
    for(let i = from; i < num; i++){
        let newCountry = generateCountry(loreData, i);
        LORE_GLOBS.COUNTRY_STATS[newCountry.name] = newCountry;
    }

    // after all countries have been generated...
    generateHistory(num);     // establish international relationships
    LORE_GLOBS.WORLD_STATS.world_powers = establishWorldPowers(); // assign world powers
    getWorries(num);          // add worry objects to every country
}

/**
 * Generates a single country's lore data, including name, ID, economy strength, and empty relationship sets.
 * @param {Object} loreData - The full lore schema.
 * @param {number} i - The index used to assign this country's ID.
 * @returns {Promise<Object>} A newly generated country object.
 */
function generateCountry(loreData, i){
    let country = generateLore(loreData.country);
    country.name = generateName();  // TODO: better country names
    country.ID = [i+1];

    country.economy_strength = getEconomyStrength(country.resource);

    country.allies = new Set();   // empty set for now, will define after all countries have been initialized
    country.enemies = new Set();  // "

    return country;
}

/**
 * Calculates a numeric economy strength score for a country based on its resources.
 * @param {string[]} resources - An array of resource names.
 * @returns {number[]} A one-element array containing the total strength score.
 */
function getEconomyStrength(resources){
    const ranking = LORE_GLOBS.WORLD_STATS.resource_ranking;
    let result = 0;

    // tally resource values (defined by ranking order)
    for(let resource of resources){
        let val = ranking.indexOf(resource) + 1;
        if(val > 0) result += val;
    }

    return [result];
}

/**
 * Randomly assigns resource-based allies or enemies to the given country.
 * Will not duplicate or contradict existing relationships.
 * @param {Object} self - The country being assigned relationships.
 * @param {number} num - Number of relationships to generate.
 * @param {string} relationship - Either "allies" or "enemies".
 */
function getRandomRelationships(self, num, relationship) {
    // opposite relationship
    const oppRelationship = (relationship === "allies") ? "enemies" : "allies";

    // array of all countries
    const  cKeys = Object.keys(LORE_GLOBS.COUNTRY_STATS);
    let randomIndex = myRandom(cKeys.length);

    for(let i = 0; i < num; i++){
        // pick a random country
        let country = LORE_GLOBS.COUNTRY_STATS[cKeys[randomIndex]]; 
        if( country.ID !== self.ID &&               // country is not self
            country.government[0] !== "none" &&     // country has a governemnt
            !country[relationship].has(self.ID) &&  // country and self are not already in relationship
            !country[oppRelationship].has(self.ID)  // country and self are not already in opposite relationship
        ){
            addRelationship(country, self, `${relationship}`, `resource_${relationship}_origin`);
        }   

        // update random index for next choice
        randomIndex = myRandom(cKeys.length);
    }
}

/**
 * Evaluates ideological similarity between countries to form alliances or rivalries.
 * Uses distance on a political compass grid to determine alignment.
 * @param {Object} self - The country undergoing evaluation.
 */
function getIdeologicalRelationships(self){
    const maxDist = getMaxGridDistance("political_compass");

    for(let c in LORE_GLOBS.COUNTRY_STATS){
        const country = LORE_GLOBS.COUNTRY_STATS[c];
        if( country.ID === self.ID ||               // country is self
            country.government[0] === "none" ||     // country has no gov
            self.allies.has(country.ID) ||          // country is already an ally to self
            self.enemies.has(country.ID) ||         // country is already an enemy to self
            country.allies.has(self.ID) ||          // self is already an ally to country
            country.enemies.has(self.ID)            // self is already an enemy to country
        ) { continue; }                             // ...then move on to next country

        // how different is self and country politically?
        let dist = getGridDistance(
            self.political_compass[0], 
            country.political_compass[0]
        );

        if(dist > maxDist/2){
            // if distance is more than half of maxDist, then self and country are enemies
            addRelationship(self, country, "enemies", "ideology_enemies_origin");
        } else if(dist < maxDist/4){
            // if distance is less than a quarter of maxDist, then self and country are allies
            addRelationship(self, country, "allies", "ideology_allies_origin");
        }
    }
}

/**
 * Creates a bilateral relationship and logs a corresponding grammar-based history entry.
 * @param {Object} A - First country (initiator).
 * @param {Object} B - Second country (target).
 * @param {string} rel - Type of relationship.
 * @param {string} type - Type of history grammar template to apply.
 */
function addRelationship(A, B, rel, type){
    A[rel].add(B.ID);    // add A to B rel (enemies/allies)
    B[rel].add(A.ID)     // add B to A rel (enemies/allies)
    
    // generate a new history message and add it to world stats
    const newHist = handleGrammar({"A": [A], "B": [B]}, type, LORE_GLOBS.HISTORY_GRAMS);
    LORE_GLOBS.WORLD_STATS.history.push(newHist);
}

/**
 * Populates each country's `worries` list based on its political, military, and economic status.
 */
function getWorries() {
    for(let c in LORE_GLOBS.COUNTRY_STATS){
        const country = LORE_GLOBS.COUNTRY_STATS[c];
        // does country have enemies?
        if(country.enemies.size > 0){
            const powerfulEnemies = hasPower(country.enemies);
            if(powerfulEnemies.length > 0){
                country.worries.push(
                    new Worry(
                        "powerful_enemies", 
                        {"A": [country], "B": powerfulEnemies}
                    )
                );
            } else {
                const enemyObjs = []
                country.enemies.forEach((id) => enemyObjs.push(getCountryByID(id[0]))); 
                country.worries.push(
                    new Worry(
                        "enemies", 
                        {"A": [country], "B": enemyObjs}
                    )
                );
            }
        }

        // does country have allies?
        if(country.allies.size === 0){
           country.worries.push(
                new Worry(
                    "no_allies", 
                    {"A": [country]}
                )
           );
        }

        let powerfulCountries = [
            LORE_GLOBS.COUNTRY_STATS[LORE_GLOBS.WORLD_STATS.world_powers[0]],
            LORE_GLOBS.COUNTRY_STATS[LORE_GLOBS.WORLD_STATS.world_powers[1]]
        ]

        // what is country's economy strength?
        let baselineEcon = powerfulCountries[1].economy_strength[0]; // strength of second larges econ
        if(country.economy_strength[0] < baselineEcon*0.75){
            country.worries.push(
                new Worry(
                    "weak_economy",
                    {"A": [country]}
                )
            );
        }

        // war risk?
        if(powerfulCountries[0].enemies.has(powerfulCountries[1].ID)){
            country.worries.push(
                new Worry(
                    "war",
                    {"A": [powerfulCountries[0]], "B": [powerfulCountries[1]]}
                )
            );
        }

        // low-autonomy government?
        if(lowAutonomyGovernment(country.political_compass[0])){
            country.worries.push(
                new Worry(
                    "freedom",
                    {"A": [country]}
                )
            );
        }
    }
}

/**
 * Retrieves and formats a worry message from a Worry object.
 * Falls back to a random worry from country's worries list, if none is provided.
 * @param {Object} country - The country experiencing the worry.
 * @param {Worry} [worry] - Optional specific worry to evaluate.
 * @returns {Promise<string>} A formatted message string.
 */
function getWorryMessage(country, worry){
    if(!worry){ worry = randomFromArray(country.worries); }
    const msg = handleGrammar(worry.fillers, worry.ID, "worry");
    return msg;
}

/**
 * Determines whether any countries in the given ID array are considered world powers.
 * @param {number[]} arr - Array of country IDs.
 * @returns {Object[]} Array of matching country objects that are world powers.
 */
function hasPower(arr){
    const powf = [];    // powerful countires listed in arr
    let worldPowers = [
        LORE_GLOBS.COUNTRY_STATS[LORE_GLOBS.WORLD_STATS.world_powers[0]].ID,
        LORE_GLOBS.COUNTRY_STATS[LORE_GLOBS.WORLD_STATS.world_powers[1]].ID
    ]
    for(let id of arr){
        if(worldPowers.includes(id)){ 
            powf.push(getCountryByID(id[0])); // add country to powf
        }
    }
    return powf;
}

/**
 * Retrieves a country object by its numeric ID.
 * @param {number} id - The ID of the country.
 * @returns {Object|null} The country object, or null if not found.
 */
function getCountryByID(id){
    for(let c in LORE_GLOBS.COUNTRY_STATS){
        const country = LORE_GLOBS.COUNTRY_STATS[c];

        if(country.ID[0] === id){
            return country;
        }
    }

    console.error(`ERROR: Country with ID ${id} not found.`);
    return null;
}

/**
 * Determines whether a country has a low-autonomy government based on its political compass position.
 * @param {string} pc - The country's political compass cell code.
 * @returns {Promise<boolean>} True if government is low-autonomy (e.g., autocratic).
 */
function lowAutonomyGovernment(pc){
    const gridJSON = LORE_GLOBS.JSON["political_compass"]
    const grid = gridJSON.grid;

    let coords = gridCellToCoords(pc);

    if(coords.x < (grid.row_vals.length/4)){ return true; }
    // ignores modifiers
    // if(coords.y < (grid.col_vals.length/2)){ return true; }

    return false;
}