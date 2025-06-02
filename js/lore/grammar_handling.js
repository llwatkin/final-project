async function generateHistory(A, B, history){
    const historyGrammars = await _loadJSON(`${LORE_GLOBS.JSON_PATH}/${LORE_GLOBS.HISTORY_GRAMS}.json`);
    
    const choices = historyGrammars[history];
    let randomIndex = Math.floor(Math.random() * choices.length);
    let pick = choices[randomIndex]

    LORE_GLOBS.WORLD_STATS.history.push(handleGrammar({"A": A, "B": B}, pick))

}

// fills grammar slots with concrete values
function handleGrammar(fillers, template){
    const slotPattern = /\$(\w+)/;  // looks for words starting with $

    while (template.match(slotPattern)) {
      template = template.replace(
        slotPattern, 
        (match) => {
            // match replacing function currently assumes that slotPatterns will refer either 
            //  to the country names, or an attribute of the second country
            // TODO: ^ will need to make this less hard-coded to allow for a wider range or grammars
            if(fillers[match.slice(1)]){
                return fillers[match.slice(1)].name
            } else {
                let randomIndex = Math.floor(Math.random(fillers.B[match.slice(1)].length))
                let pick = fillers.B[match.slice(1)][randomIndex];
                return pick
            }
        }
      );
    }

    return template;  // filled in
}