
// makes lore for {num} countries
async function genMultipleCountries(loreData, num, from = 0) {
    num = parseInt(num);
    from = parseInt(from);

    for(let i = from; i < num; i++){
        let newCountry = await generateCountry(loreData, i);
        LORE_GLOBS.COUNTRY_STATS[newCountry.name] = newCountry;
    }

    await generateHistory(num);
    LORE_GLOBS.WORLD_STATS.world_powers = await establishWorldPowers();
    await getWorryKeys(num);
    // DEBUG: console.log(countriestats)
}

// creates one country 
async function generateCountry(loreData, i){
    let country = await generateLore(loreData.country);
    country.name = await generateName();  // TODO: better country names
    country.ID = [i+1];

    country.economy_strength = getEconomyStrength(country.resource);

    country.allies = new Set();   // empty set for now, will define after all countries have been initialized
    country.enemies = new Set();  // "

    return country;
}

async function generateName() {
    const nameJSON = await _loadJSON(`${LORE_GLOBS.JSON_PATH}/name.json`);
    let success = false;
    let name = ""

    while(!success){
        for(let f in nameJSON){
            let fixArr = nameJSON[f]
            let r = myRandom(fixArr.length)
            name += fixArr[r];
        }

        if(!LORE_GLOBS.COUNTRY_STATS[name]){    // make sure name doesnt already exist
            success = true; // stop loop
        }
    }

    return [name];
}

// determines a country's economy strength by tallying the values of their resources
function getEconomyStrength(resources){
    const ranking = LORE_GLOBS.WORLD_STATS.resource_ranking;
    let result = 0;
    for(let resource of resources){
        let val = ranking.indexOf(resource) + 1;
        if(val > 0) result += val;
    }
    return [result];
}

// creates resource relationships between self and {num} countries
async function getRandomRelationships(self, num, relationship) {
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
            await addRelationship(country, self, `resource_${relationship}_origin`);
        }   

        // update random index for next choice
        randomIndex = myRandom(cKeys.length);
    }
}

async function getIdeologicalRelationships(self){
    const maxDist = await getMaxGridDistance("political_compass");

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
        let dist = await getGridDistance(
            self.political_compass[0], 
            country.political_compass[0]
        );

        if(dist > maxDist/2){
            // if distance is more than half of maxDist, then self and country are enemies
            await addRelationship(self, country, "ideology_enemies_origin");
        } else if(dist < maxDist/4){
            // if distance is less than a quarter of maxDist, then self and country are allies
            await addRelationship(self, country, "ideology_allies_origin");
        }
    }
}

async function addRelationship(A, B, type){
    A.enemies.add(B.ID);    // add A to B enemies
    B.enemies.add(A.ID)     // add B to A enemies 
    
    const newHist = await handleGrammar({"A": A, "B": B}, type, LORE_GLOBS.HISTORY_GRAMS);
    LORE_GLOBS.WORLD_STATS.history.push(newHist);
}

// give each country a set of worries
async function getWorryKeys() {
    for(let c in LORE_GLOBS.COUNTRY_STATS){
        const country = LORE_GLOBS.COUNTRY_STATS[c];
        // does country have enemies?
        if(country.enemies.size > 0){
           if(hasPower(country.enemies) === true){
                country.worries.push("powerful_enemies");
           } else {
               country.worries.push("enemies");
           }
        }

        // does country have allies?
        if(country.allies.size === 0){
           country.worries.push("no_allies");
        }

        // what is country's economy strength?
        let powerfulCountries = [
            LORE_GLOBS.COUNTRY_STATS[LORE_GLOBS.WORLD_STATS.world_powers[0]],
            LORE_GLOBS.COUNTRY_STATS[LORE_GLOBS.WORLD_STATS.world_powers[1]]
        ]

        let baselineEcon = powerfulCountries[1].economy_strength[0]; // strength of second larges econ
        if(country.economy_strength[0] < baselineEcon*0.75){
            country.worries.push("weak_economy");
        }

        // war risk?
        if(powerfulCountries[0].enemies.has(powerfulCountries[1].ID)){
            country.worries.push("war");
        }

        // TODO: low-autonomy governments (autocratic, fascist, etc) should be reflected here

        // TEMP DEBUG TEST
        if(country.worries.length > 0){
            console.log(country.worries[0],await handleGrammar({"A": country}, country.worries[0], "worry"));
        }
    }
}

// returns whether any of the IDs listed in arr are included in world_powers
function hasPower(arr){
    let powerfulCountries = [
        LORE_GLOBS.COUNTRY_STATS[LORE_GLOBS.WORLD_STATS.world_powers[0]].ID,
        LORE_GLOBS.COUNTRY_STATS[LORE_GLOBS.WORLD_STATS.world_powers[1]].ID
    ]
    for(let id of arr){
        if(powerfulCountries.includes(id)){ return true; }
    }
    return false;
}

function getCountryByID(id){
    for(let c in LORE_GLOBS.COUNTRY_STATS){
        const country = LORE_GLOBS.COUNTRY_STATS[c];

        if(country.ID === id){
            return country;
        }
    }

    console.error(`ERROR: Country with ID ${id} not found.`);
    return null;
}