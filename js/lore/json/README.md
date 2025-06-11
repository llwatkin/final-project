Here's a quick overview of what is in each json file in this filder, and how to use them.

### `_loreKeys.json`
*Basic templates for world data and and country data.*
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
>- **culture**: Stores a list of randomy-selected cultural touchstones. Doesn't do much right now.
>- **allies**: Stores a list of IDs to country's allies. Allies are chosen based on compatible ideologies (governments nearby on political compass) and randomly-selected resource agreements.
>- **enemies**: Stores a list of IDs to country's enemies. Enemies are chosen based on incompatible ideologies (governments far away on political compass) and randomly-selected resource disagreements.
>- **economy_strength**: Tallies country's resources' values.
>- **worries**: List of Worry objects, which are used to fill the grammars found in `worry.json`. Worries are assigned based on country state (enemies, allies, economy, freedom) and world state (war between world powers).

### `economy.json`

### `government.json`

### `history_grammars.json`

### `name.json`

### `political_compass.json`

### `worry.json`
