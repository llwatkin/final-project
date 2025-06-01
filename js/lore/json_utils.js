async function loadJSON(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Could not load JSON: " + error);
        return null;
    }
}

// loads choices from specified JSON
async function getChoices(data, cat, self){
    let choices = [];
    if(data[cat].choice_control){
        const controller = data[cat].choice_control;
        const choiceJSON = await loadJSON(`${LORE_GLOBS.JSON_PATH}/${controller.json}.json`);

        let loc;
        let attr_choices;
        if(controller.location === "world"){ loc = LORE_GLOBS.WORLD_STATS; }
        else if(controller.location === "self"){ loc = self; }
        else {
            console.error(`Unknown control location: ${controller.location}`)
            return;
        }

        attr_choices = loc[`${controller.attribute}`]; 
        for(const c in attr_choices){
            choices = choices.concat(choiceJSON[attr_choices[c]]); 
        }
    }
    else if(data[cat].choices){
        choices = data[cat].choices;  
    }
            
    return choices;
}

async function fetchLoreKeys(path) {
    const response = await fetch(`${path}/_loreKeys.json`);
	const json = await response.json();
	return json;
}