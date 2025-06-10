// creates a new world and fills it with {num} countries
async function generateWorld(loreData, num) {
    LORE_GLOBS.WORLD_STATS = await generateLore(loreData.world);

    LORE_GLOBS.WORLD_STATS.resource_ranking = randomlyRankResources(loreData.country.resource.choices);

    await genMultipleCountries(loreData, num);
}

// randomly ranks the values in the lore key json under country > resource
//  from low to high value
function randomlyRankResources(arr){
    let result = [...arr];
    for(let i = result.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i+1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// populate world history with grammar-generated facts
async function generateHistory(num) {
    // make relationships between countries
    // TODO: implement smarter relationship generation (maybe based on governments/ideology)
    LORE_GLOBS.WORLD_STATS.history = [];
    for(let c in LORE_GLOBS.COUNTRY_STATS){
        // if this country HAS a governmenet....
        if(LORE_GLOBS.COUNTRY_STATS[c].government[0] !== "none"){
            if(LORE_GLOBS.COUNTRY_STATS[c].allies.size === 0){
                await getRandomAllies(
                    LORE_GLOBS.COUNTRY_STATS[c], 
                    Math.floor(Math.random() * num)
                );
            }
            if(LORE_GLOBS.COUNTRY_STATS[c].enemies.size === 0){
                await getRandomEnemies(
                    LORE_GLOBS.COUNTRY_STATS[c], 
                    Math.floor(Math.random() * num)
                );
            }
        }
    }
}

// set the two richest countries as world powers
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