async function explainRelationship(A, B, rel){
    const historyGrammars = await _loadJSON(`${LORE_GLOBS.JSON_PATH}/${LORE_GLOBS.HISTORY_GRAMS}.json`);
    
    const choices = historyGrammars[rel];
    let randomIndex = Math.floor(Math.random() * choices.length);
    let pick = choices[randomIndex]

    LORE_GLOBS.WORLD_STATS.history.push(handleCountryGrammar({"A": A, "B": B}, pick))

}

// fills grammar slots with concrete values
function handleCountryGrammar(fillers, template){
    const slotPattern = /\$(\w.\w+)/;  // looks for words starting with $

    while (template.match(slotPattern)) {
      template = template.replace(
        slotPattern, 
        (match) => {
            // match should be in the format {country}.{parameter}, fillers should hold references to
            //      the countries being discussed here.
            const fillerControl = match.split('.')[0].slice(1);     // remove $
            const country = fillers[fillerControl];                 // A or B
            const param = match.split('.')[1];                      // what country param?
            const property = country[param];

            const randomIndex = Math.floor(Math.random() * property.length)
            const pick = property[randomIndex];
            return pick

        }
      );
    }

    return template;  // filled in
}