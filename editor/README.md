# RWK Level Editor

Here I am making the level editor.
The actual editor is "Tiled" (https://www.mapeditor.org/) so go ahead and install it.
Check out installation instructions for the tools in this project blow.

## How to make RWK levels with this tool:

To start with, you will need to grab the tiles from the game. The tiles are not
included in this project because they are proprietary artwork from raptisoft.
This tool includes a function, called the fuzzer, to automatically grab all relevant 
tiles from the game. You only need to execute it once, so go ahead and do that now:

    npm run start 
    # on the prompt type f

Now you have all the tiles. You can open the Tiled editor and open the tileset
definitions that are saved under `resources\tilesets`. 

It is recommended that you set Tiled to snap everyting to the grid. Do this under view>Snapping>Snap to grid.

Next create a new map in Tiled. Make sure to select
- orientation:orthogonal
- tile layer format:csv
- tile render order:Right Down
- Maps size: infinite
- Tile size: 40px by 40px

You can now create your map by placing tiles from the tileset. Please follow these rules:
- use layers to place more than one tile per cell. Recommended layer names: "base" and "paint"
- a cell may have at most one base tile and at most one paint tile. Any more does not work.
- base tiles (from the base tileset) determine cell behavior. Paint tiles (all the others) only change the look.
- the number of layers, their names, their order does not matter. You can mix base and paint tiles in every layer as long as you follow the rules above.

When you are done, save the map as a ".json" file and place it into the folder `levels_to_convert\`

Now start the tool agan with `npm run start`. Now select `c` at the prompt. Your level will be converted
into a `.kitty` file and placed in the folder `levels_in\`.

If you now want to inject the level into the game, do this:
- `npm run start`
- select `s` to start the game.
- select `i` to inject all levels from `levels_in\` into the game.

You will need to fix the robot and kitty position in the in-game level editor. These settings are not suppoted yet.

Have fun.

### Extras

#### Updated .kitty file
The converter will discover if there is already a .kitty file in the target location.
If there is, features that the converter does not support will not be overwritten.
Said another way, the converter adds supported features into the .kitty files and leaves 
unsupported stuff intact.

You can fix your robot and kitty positions, music, conveyor speed etc in a level, extract the level,
and copy it into the `level_in/` folder, and these parts will remain set as they were on the next conversion.

#### Radio Beacons
The editor now supports callout texts. Simply create an object layer and add text boxes in the same location
as a radio beacon tile. The converter will associate the two based on position.

## Installation

To use the tools in the current folder you will need NodeJS (google for the installer).
Then navigate to this folder using a command line.
To prepare for running type:

    npm install
This needs to be done when the project is new or has been updated.

To run type

    npm run start


# TODO

Not supported yet:
- Radio Beacon texts. They are next on the list and will make use of the object layer in the Tiled editor. The structure is understood, and we just need to code this.
- Kitty and Robot postions. The structure is unknown.
- exporting levels from the game into the Tiled editor format is not supported yet. The full structure of how paint is encoded is not understood yet. 
- conveyor speed setting. We havn't worked on it yet.
- Level Tags. We havn't worked on it yet.
- Custom music settings. We havn't worked on it yet.
