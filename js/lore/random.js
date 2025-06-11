// deterministic random handling
function deterministicRandom(){
    randomSeed(SEED);
    // TODO
}

// pseudo random
function myRandom(max, min = 0){
    const r = Math.floor(random() * (max - min)) + min;
    return r;
}

function coinflip(pass = 0.5){
    randomSeed(SEED);
    return random() > pass;
}