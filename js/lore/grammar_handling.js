async function handleGrammar(fillers, n, json){
    const grammar = await _loadJSON(`${LORE_GLOBS.JSON_PATH}/${json}.json`);
    
    const choices = grammar[n];
    let randomIndex = myRandom(choices.length);
    let pick = choices[randomIndex]

    return fillGrammarTemplate(fillers, pick);

}

// fills grammar slots with concrete values
function fillGrammarTemplate(fillers, template){
    const slotPattern = /\$(\w.\w+)/;  // looks for words starting with $

    while (template.match(slotPattern)) {
      template = template.replace(
        slotPattern, 
        (match) => {
            // match should be in the format {country}.{parameter}, fillers should hold references to
            //      the countries being discussed here.
            const fillerControl = match.split('.')[0].slice(1);     // remove $
            const country = randomFromArray(fillers[fillerControl]);                 // A or B
            const param = match.split('.')[1];                      // what country param?
            const property = country[param];

            const randomIndex = myRandom(property.length)
            const pick = property[randomIndex];
            return pick

        }
      );
    }

    return template;  // filled in
}