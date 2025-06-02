// lore.js
// Author(s): Raven Cruz
// Last Updated: 6/1/2025
// handler functions for generating world lore

// creates a new world and fills it with {num} countries
async function generateWorld(loreData, num) {
    LORE_GLOBS.WORLD_STATS = await generateLore(loreData.world);
    await genMultipleCountries(loreData, num);
}

// makes lore for {num} countries
async function genMultipleCountries(loreData, num, from = 0) {
    num = parseInt(num);
    from = parseInt(from);

    for(let i = from; i < num; i++){
        let newCountry = await generateCountry(loreData, i);
        LORE_GLOBS.COUNTRY_STATS[newCountry.name] = newCountry;
    }

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

    // DEBUG: console.log(countriestats)
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
            await generateHistory(potentialAlly, self, "ally_origin");
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
            
            await generateHistory(potentialEnemy, self, "enemy_origin");
        }   

        // update random index for next choice
        randomIndex = Math.floor(Math.random() * cKeys.length);
    }
}

// creates one country 
async function generateCountry(loreData, i){
    let country = await generateLore(loreData.country);
    country.name = [`country ${i+1}`];  // TODO: better country names
    country.ID = [i+1];
    country.allies = new Set();   // empty set for now, will define after all countries have been initialized
    country.enemies = new Set();  // "

    return country;
}

// randomly generates lore using json data
async function generateLore(data){
    const base = {};

    for(let cat in data){
        const maxPicks = data[cat].maxPicks;
        const minPicks = (data[cat].minPicks) ? data[cat].minPicks : 0;
        const numPicks = Math.ceil(Math.random() * (maxPicks - minPicks)) + minPicks;

        // create a new set to hold data for this cat(egory)
        base[cat] = new Set();

        // retrieve choices (as defined in json data)
        let choices;
        if(data[cat].length !== 0){ 
            choices = await getChoices(data, cat, base);
        }

        // pick a choice, {num} times
        for(let i = 0; i < numPicks; i++){
            if(choices === null){
                console.error(`ERROR: unable to load choices for {${cat}}`);
                break;
            }

            // cap numPicks to possible choices (as defined in json data)
            if(data[cat].length < numPicks){ numPicks = choices.length; }

            // pick randomly from choices
            const randomIndex = Math.floor(Math.random() * (choices.length));
            let pick = choices[randomIndex];

            // add a prefix word (modifier) when possible/necessary
            if(pick && pick !== "none" && data[cat].modifiers){
                let mods = data[cat].modifiers.values;

                const randomIndex = Math.floor(Math.random() * (mods.length));
                const modifier = mods[randomIndex];

                if(modifier.length > 0){ pick = modifier + " " + pick; }
            }

            // add picked choice to set
            base[cat].add(pick);
        }
        base[cat] = [...base[cat]]; // convert set to an array
    }
    
    //DEBUG: console.log(base);
    return base;
}

function trimCountries(num){
    // trim the last {num} keys
    const trimKeys = Object.keys(GLOBAL.COUNTRY_STATS).slice(-num);
    for(const key of trimKeys){
        let deleteCountry = GLOBAL.COUNTRY_STATS[key];

        for(let c in GLOBAL.COUNTRY_STATS){
            let country = GLOBAL.COUNTRY_STATS[c];
            if(country.enemies.has(deleteCountry.ID)){
                country.enemies.delete(deleteCountry.ID);
            }
            if(country.allies.has(deleteCountry.ID)){
                country.allies.delete(deleteCountry.ID);
            }
        }

        delete GLOBAL.COUNTRY_STATS[key];
    }
}