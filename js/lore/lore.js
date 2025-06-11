// lore.js
// Author(s): Raven Cruz
// Last Updated: 6/1/2025
// handler functions for generating world lore

// randomly generates lore using json data
async function generateLore(data){
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
            let picks = await specialHandler(data[cat], base);
            picks.forEach(elem => base[cat].add(elem));
        } else {
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

// LEGACY/DEBUG
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
