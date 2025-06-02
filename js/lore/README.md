## lore generator 
generates a world's lore based on time period and main form of government
- run `index.html` in `./js/lore` for a demo scene, displaying the generated lore as a printout on the webpage (handy for debugging)

### lore keys json
`_loreKeys.json` *contains the keys (or sub-categories) for each broad category in this lore generator.*

## how it works
### world stats generation
First, world stats are generated, excluding history. Each property in `"world"` with a `maxPicks` sub-property will have an array of `choices`, and a random number of choices will be chosen from this array, up to `maxPicks`.
- `epoch`: one pick, determines what time period the world is in
- `economy`: one pick, determines the category of currency this world uses (`none`, `physical`, `ephemeral`, or `hybrid`)
- `resource ranking`: represents the relative values of all of the possible resources in the world. This ranking is achieved by randomly shuffling the resource choices, and the resulting array ranks the resources from low (index `0`) to high (index `n`) value.

> NOTE: `history` *will be added after all continents have been generated (see below)*

### continent stats generation
Next, continent stats are generated, referring to `world` properties when necessary.
- `name`: the continent's name
- `ID`: unique numeric identifier for the continent
- `currency`: depends on `world economy`, generator calls a json file that defines different currencies for each type in lore keys' economy property
> NOTE: *all continents will use the same general type of currency, but the currencies may differ (like how, irl we all use physical currencies, but they differ in name/value -- usd, yen, euro, etc.)*
- `government`: randomly selected
- `resource`: randomly selected
- `culture`: randomly selected
> NOTE: *the values here refer to cultural touchstones, without further specification*
- `economy_strength`: tallies the values of each of the country's resources, where the values are determined by the order of world's `resource ranking` array

All of the above stats are generated, leaving `allies` and `enemies` empty until every continent has been generated. Once all have been generated, we then populate their `allies` and `enemies` randomly.
- `allies`: randomly chooses other continents that aren't already enemies.
- `enemies`: randomly chooses other continents that aren't already allies.

### world history
Once continents and their relationships have been defined, we then generate a grammars-based history to explain the relationships.
- Example: `Continent A became enemies with Continent B when Continent B adopted democracy.`

## TO-DO
- **continents' economy strength**
- **dialogue system**
    - take world state, continent state, and make dialogue that discusses it.

> `grammar_handling.js`
- will need to make slot-filling logic less hard-coded to allow for a wider range or grammars

> `lore.js`
- implement smarter relationship generation (maybe based on governments/ideology)
- name generation for world and continents!!
