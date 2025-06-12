/**
 * Loads grammars from a JSON file and returns a filled-in string template based on the given grammar key.
 * @param {Object} fillers - An object containing arrays of entities (e.g. {"A": [countryA], "B": [countryB]}).
 * @param {string} key - The grammar key to select from the loaded grammar file.
 * @param {string} json - The filename (without extension) of the grammar JSON file to load.
 * @returns {Promise<string>} A single grammar string with all placeholders filled.
 */
function handleGrammar(fillers, key, json){
    const grammar = LORE_GLOBS.JSON[json]
    
    const choices = grammar[key];
    let randomIndex = myRandom(choices.length);
    let pick = choices[randomIndex]

    return fillGrammarTemplate(fillers, pick);
}

/**
 * Fills placeholders in a grammar string template using the provided fillers.
 * Grammar slots follow the format "$A.name", "$B.government", etc.
 * Randomly selects a value from the appropriate filler field if the property is an array.
 * @param {Object} fillers - Named entities to use as grammar replacements (e.g., {"A": [countryA], "B": [countryB]}).
 * @param {string} template - The grammar string containing placeholders to be filled.
 * @returns {Promise<string>} A fully-resolved string with all grammar slots replaced.
 */
function fillGrammarTemplate(fillers, template){
    const slotPattern = /\$(\w.\w+)/;  // looks for words starting with $

    while (template.match(slotPattern)) {
      template = template.replace(
        slotPattern, 
        (match) => {
            // match should be in the format {country}.{parameter}, fillers should hold references to
            //      the countries being discussed here.
            const fillerControl = match.split('.')[0].slice(1);       // remove $
            const country = randomFromArray(fillers[fillerControl]);  // A or B
            const param = match.split('.')[1];                        // what country param?
            const property = country[param];

            const randomIndex = myRandom(property.length)
            const pick = property[randomIndex];
            return pick

        }
      );
    }

    return template;  // filled in
}