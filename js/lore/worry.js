/**
 * Represents a specific concern or geopolitical pressure faced by a country.
 * Used to generate narrative events through grammar templates.
 */
class Worry {
    /**
     * Constructs a new Worry instance.
     * @param {string} ID - The worry category ID (e.g., "war", "weak_economy").
     * @param {Object} fillers - An object containing entities used to fill grammar templates (e.g., {"A": [countryA], "B": [countryB]}).
     */
    constructor(ID, fillers){
        this.ID = ID;
        this.fillers = fillers;
    }
}