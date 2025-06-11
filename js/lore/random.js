// deterministic random handling
function deterministicRandom(){
    //randomSeed(SEED);
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

function randomFromArray(arr){
    const len = arr.length;
    const i = myRandom(len);

    return arr[i]
}