// deterministic random handling
function myRandom(max, min = 0){
    randomSeed(SEED);
    //let r = Math.floor(Math.random() * max);
    const r = Math.floor(random() * (max - min)) + min;
    return r;
}

function coinflip(pass = 0.5){
    randomSeed(SEED);
    return random() > pass;
}