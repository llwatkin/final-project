Here's an overview of what is in each json file in this folder, and how to use them.

## `_loreKeys.json`
*Basic templates for world data and and country data.*

### Usage
#### basic
Add categories to be loaded as properties into `world` and `country` objects. Without any choice artictecture, these properties will remain empty, but you can fill them however you want in the lore generator. 

#### choice handling
In `lore.js`, the function `generateLore()` checks for choice architecture. Choices are an array of strings, and a `maxPicks` property puts a ceiling (and `minPicks` puts a floor) on how many from that array will be loaded into the property.

#### `choice_control`
Directs choice selection to a different json file. May also define `location` and `attribute` properties if choice selection depends on another property, either in the `world` or `country` object.

#### processes, special handling
In `lore.js`, the function `generateLore()` also checks for `special` property, which directs choice gathering from the random selection a heuristic to handler defined in `json_utils.js`. 

>*This can be any gatherer you define, but make sure to add a reference to it to the `SPECIAL` object in `json_utils.js`.*

Likewise, the `process` property redirects choice *selection* to the from the basic choice selector to a specific process, referenced in `json_utils.js`

>*Again, this can be any selection process you define, but make sure to add a reference to it to the `PROCESSES` object in `json_utils.js`.*

### Categories
#### `world`
>- **name**: Will hold the world's randomly-generated name.
>- **epoch**: Time period. Doesn't do much right now.
>- **economy**: What kind of economy does this world use? (none? physical? ephemeral? hybrid?)
>- **resource_ranking**: Takes possible resources from `country` template and randomly ranks them, assigning their relative values.
>- **history**: Holds random messages about worldwide alliances and enemies, after all countries have been generated and relationships drawn.
>- **world_powers**: Holds the names of the two world powers (decided by economy size after all countries have been generated).

#### `country`
>- **name**: Will hold the country's randomly-generated name.
>- **ID**: Will hold the unique numeric identifier for the country. Useful for quick lookups.
>- **currency**: Chooses a currency type based on `world` economy type. Choices are stored in `economy.json`.
>- **political_compass**: Assigns country a random cell in the grid defined in `political_compass.json`.
>- **government**: Uses `political_compass` cell to write out the government type. Values are stored in `government.json`.
>- **resource**: Stores a list of randomly-selected resources. These are the country's exports, and they affect the country's `economy_strength`.
>- **culture**: Stores a list of randomly-selected cultural touchstones. Doesn't do much right now.
>- **allies**: Stores a list of IDs to country's allies. Allies are chosen based on compatible ideologies (governments nearby on political compass) and randomly-selected resource agreements.
>- **enemies**: Stores a list of IDs to country's enemies. Enemies are chosen based on incompatible ideologies (governments far away on political compass) and randomly-selected resource disagreements.
>- **economy_strength**: Tallies country's resources' values.
>- **worries**: List of Worry objects, which are used to fill the grammars found in `worry.json`. Worries are assigned based on country state (enemies, allies, economy, freedom) and world state (war between world powers).

## `economy.json`
Holds currency choices for each economy type. 

## `government.json`
Holds row and column values for political compass cells. Rows are the basic government type (Totalitarianism, Democracy, Anarchism, etc) and columns are modifying adjectives (traditionalist, Liberal, Anarchistic, etc). 
> ***NOTE**: For both rows and columns, smaller values = lower autonomy, larger values = more autonomy.*
>
> Consequentially, any cell falling in quadrant one correspond to governments with lower overall freedoms. 
> 
>This is important to preserve for countries' worry generation -- a country will worry about having rigid, overbearing governments.  

## `history_grammars.json`
Holds grammars for explaining country relationships. Organized by relationship type.

## `name.json`
Holds syllables for name generation, organized by prefix, core (middle), and suffix.

## `political_compass.json`
Defines the grid that will be used in conjunction with `government.json` to assign governments to countries. Rows and cols are [A-H] and [1-8], respectively. Each of these values should have a corresponding array in `government.json`.

## `worry.json`
Holds grammars for outputting worry messages, organized by worry types.