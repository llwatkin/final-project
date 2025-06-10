
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
    await generateWorryKeys(num);
    // DEBUG: console.log(countriestats)
}

// creates one country 
async function generateCountry(loreData, i){
    let country = await generateLore(loreData.country);
    country.name = [`country ${i+1}`];  // TODO: better country names
    country.ID = [i+1];

    country.economy_strength = getEconomyStrength(country.resource);

    country.allies = new Set();   // empty set for now, will define after all countries have been initialized
    country.enemies = new Set();  // "

    return country;
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

// creates up to {num} allyships between {self} country and randomly selected others
async function getRandomAllies(self, num){
    const allies = self.allies;
    // array of all countries
    const  cKeys = Object.keys(LORE_GLOBS.COUNTRY_STATS);
    let randomIndex = Math.floor(Math.random() * cKeys.length);

    for(let i = 0; i < num; i++){
        // pick a random country
        let potentialAlly = LORE_GLOBS.COUNTRY_STATS[cKeys[randomIndex]]; 
        if( potentialAlly.ID !== self.ID &&             // ally is not self
            potentialAlly.government[0] !== "none" &&   // ally has a governemnt
            !self.enemies.has(potentialAlly.ID) &&      // ally is not an enemy of self
            !potentialAlly.enemies.has(self.ID)         // self is not an ally of enemy
        ){
            // add as self's ally
            allies.add(potentialAlly.ID);
            // add self to ally's allies 
            potentialAlly.allies.add(self.ID)    
            
            // add allyship origin to history
            await explainRelationship(potentialAlly, self, "ally_origin");
        }   

        // update random index for next choice
        randomIndex = Math.floor(Math.random() * cKeys.length);
    }
}

// creates up to {num} enemyships between {self} country and randomly selected others
async function getRandomEnemies(self, num){
    const enemies = self.enemies;
    // array of all countries
    const  cKeys = Object.keys(LORE_GLOBS.COUNTRY_STATS); 
    let randomIndex = Math.floor(Math.random() * cKeys.length);

    for(let i = 0; i < num; i++){
        // pick a random country
        let potentialEnemy = LORE_GLOBS.COUNTRY_STATS[cKeys[randomIndex]]; 
        if( potentialEnemy.ID !== self.ID &&            // enemy is not self
            potentialEnemy.government[0] !== "none" &&  // enemy has a governemtn
            !self.allies.has(potentialEnemy.ID) &&      // enemy is not an ally of self
            !potentialEnemy.allies.has(self.ID)         // self is not and ally of enemy
        ){
            // add as self's enemy
            enemies.add(potentialEnemy.ID);
            // add self to enemy's enemies 
            potentialEnemy.enemies.add(self.ID)  
            
            await explainRelationship(potentialEnemy, self, "enemy_origin");
        }   

        // update random index for next choice
        randomIndex = Math.floor(Math.random() * cKeys.length);
    }
}

// give each country a set of worries
async function generateWorryKeys() {
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