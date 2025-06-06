
// makes lore for {num} countries
async function genMultipleCountries(loreData, num, from = 0) {
    num = parseInt(num);
    from = parseInt(from);

    for(let i = from; i < num; i++){
        let newCountry = await generateCountry(loreData, i);
        LORE_GLOBS.COUNTRY_STATS[newCountry.name] = newCountry;
    }

    generateHistory(num);
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