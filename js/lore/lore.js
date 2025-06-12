// lore.js
// Author(s): Raven Cruz
// Last Updated: 6/11/2025
// handler functions for generating world lore

/**
 * Generates a structured lore object by sampling from JSON-defined categories.
 * Each category can define a number of picks, modifiers, and special handlers.
 * @param {Object} data - The parsed JSON object containing categories and choice metadata.
 * @returns {Promise<Object>} A generated lore object with category keys and picked values as arrays.
 */
function generateLore(data){
    const base = {};

    for(let cat in data){
        const maxPicks = data[cat].maxPicks;
        const minPicks = (data[cat].minPicks) ? data[cat].minPicks : 0;
        const numPicks = myRandom(maxPicks, minPicks) + 1;

        // create a new set to hold data for this cat(egory)
        base[cat] = new Set();

        // check for special handler in choice control
        let cc = data[cat].choice_control;
        let sp = cc ? cc.special : undefined;
        if(sp){
            let picks = specialHandler(data[cat], base);
            picks.forEach(elem => base[cat].add(elem));
        } else {
            // retrieve choices (as defined in json data)
            let choices;
            if(data[cat].length !== 0){ 
                choices = getChoices(data, cat, base);
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
                const randomIndex = myRandom(choices.length);
                let pick = choices[randomIndex];

                // add a prefix word (modifier) when possible/necessary
                if(pick && pick !== "none" && data[cat].modifiers){
                    let mods = data[cat].modifiers.values;

                    const randomIndex = myRandom(mods.length);
                    const modifier = mods[randomIndex];

                    if(modifier.length > 0){ pick = modifier + " " + pick; }
                }

                // add picked choice to set
                base[cat].add(pick);
            }
        }
        base[cat] = [...base[cat]]; // convert set to an array
    }
    
    //DEBUG: console.log(base);
    return base;
}

/**
 * Generates a unique place name using prefix/core/suffix fragments defined in name.json.
 * Ensures the generated name does not already exist in COUNTRY_STATS or WORLD_STATS.
 * @returns {Promise<string[]>} A one-element array containing the generated name.
 */
function generateName() {
    const nameJSON = LORE_GLOBS.JSON["name"]
    let success = false;
    let name = ""

    while(!success){
        for(let f in nameJSON){
            let fixArr = nameJSON[f]
            let r = myRandom(fixArr.length)
            name += fixArr[r];
        }

        if( !LORE_GLOBS.COUNTRY_STATS[name] &&
            LORE_GLOBS.WORLD_STATS.name !== name
        ){    // make sure name doesnt already exist
            success = true; // stop loop
        }
    }

    return [name];
}

/**
 * Resets all world-level stats, including powers and shared lore state.
 * Does not affect LORE_DATA.
 */
function resetWorld(){
    //LORE_GLOBS.LORE_DATA = {}
    LORE_GLOBS.WORLD_STATS = {}
    LORE_GLOBS.COUNTRY_STATS = {}
}

/**
 * Clears all entries in COUNTRY_STATS without affecting WORLD_STATS.
 * Useful for refreshing country generation while preserving global context.
 */
function resetCountries(){
    LORE_GLOBS.COUNTRY_STATS = {}
}

/**
 * [LEGACY/DEBUG]
 * Deletes the last `num` countries from GLOBAL.COUNTRY_STATS and cleans up any relationships.
 * Primarily used for debugging or legacy trimming behavior.
 * @param {number} num - Number of countries to remove from the end of the COUNTRY_STATS list.
 */
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

/**
 * Generates a worry-based dialogue message for a random country.
 * 
 * If the selected country has no existing worries, this function forces the
 * generation of an enemy relationship and creates a new worry of type "enemies".
 * It then retrieves a formatted dialogue string based on that worry.
 * 
 * @function getRandomWorryDialogue
 * @returns {Promise<string>} A formatted dialogue string representing a worry-related message.
 */
function getRandomWorryDialogue(country, forceWorry = false){
    if(!country) country = randomFromObject(LORE_GLOBS.COUNTRY_STATS);

    if(forceWorry){
        // if country has no worries, force a new enemy for a worry
        while(country.worries.length === 0){
            getRandomRelationships(country, 1, "enemies");

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

    if(country.worries.length === 0) return "";

    const worry = randomFromArray(country.worries);
    let dialogue = getWorryMessage(country, worry);
    //console.log(dialogue)
    return dialogue;
}

/**
 * Renders a single set of stats (world or country) to the appropriate DOM container.
 * @param {Object} base - The object of stats to print.
 * @param {string} level - Either "world" or "country" (used for ID and labeling).
 */
function printLore(base, level, detail) {
  const title = `${level.toUpperCase()}`;

  let printOut = `<h3>${title}</h3>`;

  if(!detail){ detail = { attributes: Object.keys(base) }}
  else if(detail.obj){ 
    base = detail.obj;
    if(!detail.attributes){ detail.attributes = Object.keys(base) }
  }
  for (let b of detail.attributes) {
    let b_items = Array.isArray(base[b])
      ? base[b].join('</p>')
      : base[b]; // handle string/number fallback

    printOut += `<p><b>${b}</b>: ${b_items}</p>`;
  }

  if(detail.process){
    for(let p of detail.process){
        printOut += `<p>${p.fn(p.params)}</p>`;
    }
  }

  return printOut;
}

function printRelationships(self){
    console.log("print relationships", self);
    let printOut = "";

    if(self.allies.size > 0){
        printOut += '<b>allies</b>: '

        for(let allyID of self.allies){
            printOut += `${getCountryByID(allyID[0]).name}</p>`;
        }
    }

    if(self.enemies.size > 0){
        printOut += '<b>enemies</b>: '

        for(let enemyID of self.enemies){
            printOut += `${getCountryByID(enemyID[0]).name}</p>`;
        }
    }

    return printOut;
}

function printWorry(self){
    let printOut = "";
    let worry = getRandomWorryDialogue(self);
    if(worry.length > 0){
        printOut += `<b>worry</b>: ${worry}`
    }
    return printOut;
}