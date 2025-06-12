/**
 * Creates a new world, generates global stats, ranks resources, and populates with countries.
 * @param {Object} loreData - Parsed JSON object containing world and country schemas.
 * @param {number} num - Number of countries to generate within the world.
 */
function generateWorld(loreData, num) {
    resetWorld();

    LORE_GLOBS.WORLD_STATS = generateLore(loreData.world);
    LORE_GLOBS.WORLD_STATS.name = generateName();

    LORE_GLOBS.WORLD_STATS.resource_ranking = randomlyRankResources(loreData.country.resource.choices);

    genMultipleCountries(loreData, num);
}

/**
 * Randomly shuffles an array of resources to establish a global ranking (from low to high value).
 * @param {string[]} arr - Array of resource names to shuffle.
 * @returns {string[]} A new array with randomly ordered resource values.
 */
function randomlyRankResources(arr){
    let result = [...arr];
    for(let i = result.length - 1; i > 0; i--){
        const j = myRandom(i+1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Populates the world’s historical record with facts generated from country relationships.
 * Includes ideological alignments and random resource-based alliances/enmities.
 * @param {number} num - Number of countries (used to determine relationship scope).
 */
function generateHistory(num) {
    // make relationships between countries
    LORE_GLOBS.WORLD_STATS.history = [];
    for(let c in LORE_GLOBS.COUNTRY_STATS){
        // if this country HAS a government....
        if(LORE_GLOBS.COUNTRY_STATS[c].government[0] !== "none"){
            getIdeologicalRelationships(
                LORE_GLOBS.COUNTRY_STATS[c]
            );
            if(coinflip()){ // random allies
                getRandomRelationships(
                    LORE_GLOBS.COUNTRY_STATS[c], 
                    myRandom(num),
                    "allies"
                );
            }
            if(coinflip()){ // random enemies
                getRandomRelationships(
                    LORE_GLOBS.COUNTRY_STATS[c], 
                    myRandom(num),
                    "enemies"
                );
            }
        }
    }
}

/**
 * Identifies the two countries with the highest economy scores and designates them as world powers.
 * @returns {Promise<string[]>} An array of two country names representing the strongest economies.
 */
function establishWorldPowers(){
    let max1 = { name: null, val: -Infinity};
    let max2 = { name: null, val: -Infinity};
    for(let c in LORE_GLOBS.COUNTRY_STATS){
        let country = LORE_GLOBS.COUNTRY_STATS[c];
        if(country.economy_strength[0] >= max1.val){
            max2 = max1;
            max1 = {
                name: country.name[0],
                val: country.economy_strength[0]
            };
        } else if(country.economy_strength[0] >= max2.val){
            max2 = {
                name: country.name[0],
                val: country.economy_strength[0]
            };
        }
    }
    return [max1.name, max2.name];
}