const updateNumContinentsButton = document.getElementById("num-continents-button");
updateNumContinentsButton.addEventListener('click', async function() {
    const oldNum = LORE_GLOBS.NUM_CONTINENTS;
    LORE_GLOBS.NUM_CONTINENTS = parseInt(document.getElementById("num-continents").value);

    if(oldNum < LORE_GLOBS.NUM_CONTINENTS){
        await genMultipleContinents(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_CONTINENTS, oldNum);
        printContinents();
    } else if (oldNum > LORE_GLOBS.NUM_CONTINENTS){
        trimContinents(oldNum - LORE_GLOBS.NUM_CONTINENTS);
        printContinents();
    }
});

if(fetchLoreKeys(LORE_GLOBS.JSON_PATH)){
    init(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_CONTINENTS);
}

// load new lore base
document.addEventListener('keydown', (e) => {
	if(e.key.toLowerCase() === "r"){
        document.getElementById(`continent-stats`).innerHTML = "";
        genMultipleContinents(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_CONTINENTS);
        printContinents();
    }
    if(e.key.toLowerCase() === "w"){
        init(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_CONTINENTS);
        printWorld();
	}
});

async function init(loreData, num){
    await generateWorld(loreData, num);

    printWorld();
    printContinents();
}

function printWorld(){
    document.getElementById(`world-stats`).innerHTML = "";
    printLore(LORE_GLOBS.WORLD_STATS, "world");
}

function printContinents(){
    document.getElementById(`continent-stats`).innerHTML = "";
    for(let continent in LORE_GLOBS.CONTINENT_STATS){
        printLore(LORE_GLOBS.CONTINENT_STATS[continent], "continent")
    }
}

function printLore(base, level){
    let printTo = document.getElementById(`${level.toLowerCase()}-stats`);
    let printOut = `<h3>${level.toUpperCase()} STATS</h3>`;

    for(let b in base){
        let b_items = "";

        for(let item of base[b]){
            b_items += `${item}, `
        }
        b_items = b_items.slice(0, -2); // remove ", "

        printOut += `<p><b>${b}</b>: ${b_items}`;
    }
    //printOut += `<p><b>${pillar.substring(2)}</b>: ${dat[pillar][randomIndex]}</p>`
    printTo.innerHTML += printOut;
}