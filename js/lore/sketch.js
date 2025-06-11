// ./js.lore.sketch.js
// demo scene for lore generation 

const updateNumCountriesButton = document.getElementById("num-countries-button");
updateNumCountriesButton.addEventListener('click', async function() {
    const oldNum = LORE_GLOBS.NUM_COUNTRIES;
    LORE_GLOBS.NUM_COUNTRIES = parseInt(document.getElementById("num-countries").value);

    if(oldNum < LORE_GLOBS.NUM_COUNTRIES){
        await genMultipleCountries(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES, oldNum);
        printWorld();
        printCountries();
    } else if (oldNum > LORE_GLOBS.NUM_COUNTRIES){
        trimCountries(oldNum - LORE_GLOBS.NUM_COUNTRIES);
        printWorld();
        printCountries();
    }
});

// load new lore base
document.addEventListener('keydown', async (e) => {
	if(e.key.toLowerCase() === "r"){
        SEED = random() * 1000;
        resetCountries();
        await genMultipleCountries(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES);

        document.getElementById(`country-stats`).innerHTML = "";
        document.getElementById(`world-stats`).innerHTML = "";
        printWorld();
        printCountries();
    }
    if(e.key.toLowerCase() === "w"){
        SEED = random() * 1000;
        await initWorldLore(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES);
        printWorld();
	}
});

async function setup() {
    LORE_GLOBS.LORE_DATA = await fetchLoreKeys(LORE_GLOBS.JSON_PATH);
    initWorldLore(LORE_GLOBS.LORE_DATA, LORE_GLOBS.NUM_COUNTRIES)
}

async function initWorldLore(loreData, num){
    await generateWorld(loreData, num);

    printWorld();
    printCountries();
}

function printWorld(){
    document.getElementById(`world-stats`).innerHTML = "";
    printLore(LORE_GLOBS.WORLD_STATS, "world");
}

function printCountries(){
    document.getElementById(`country-stats`).innerHTML = "";
    for(let country in LORE_GLOBS.COUNTRY_STATS){
        printLore(LORE_GLOBS.COUNTRY_STATS[country], "country")
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