# RWK Level Editor

Here I am making the level editor.
The actual editor is "Tiled" (https://www.mapeditor.org/) so go ahead and install it.
Check out installation instructions for the tools in this project blow.

## How to make RWK levels with this tool:

It is recommended that you set Tiled to snap everything to the grid when working 
tile layers. 
Do this under view>Snapping>Snap to grid.

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
- Make sure you place exactly one kitty and one robot tile anywhere.

When you are done, save the map as a ".json" file and place it into the folder `levels_to_convert\`

Now start the tool agan with `npm run start`. Now select `c` at the prompt. Your level will be converted
into a `.kitty` file and placed in the folder `levels_in\`.

If you now want to inject the level into the game, do this:
- `npm run start`
- select `s` to start the game.
- select `i` to inject all levels from `levels_in\` into the game.

You will need to fix the robot and kitty position in the in-game level editor. These settings are not suppoted yet.

Have fun.

### One time setup

The fist time you run this tool, you will need to grab the tiles from the game. The tiles are not
included in this project because they are proprietary artwork from raptisoft.
This tool includes a function, called the fuzzer, to automatically grab all relevant
tiles from the game. You only need to execute it once, so go ahead and do that now:

    npm run start 
on the prompt type `f`

Now you have all the tiles. You can open the Tiled editor and open the tileset
definitions that are saved under `resources\tilesets`.


### Radio Beacons
The editor supports callout texts. Simply create an object layer and add text boxes in the same location
as a radio beacon tile. The converter will associate the two based on position.

### Robot and Kitty

Robot and kitty are special tiles in the tileset called `robot`. Placing any more than one of each 
will not work in the conversion stage. Robot and kitty do not need to be placed in the grid.
If you turn off snapping to grid, and use an Object Layer (like for callouts), you can add the two
on boundaries, or outside the cell grid.

### Conveyor speed

You can set the conveyor speed for the level in Tiled. Open the map properties from the
toolbar `Map`>`Map Properties`. Using the '+' below the custom properties section, add 
a property of type `float` and call it `conveyor_speed`. Change this value to the desired
conveyor speed in the game.
- 0.1 is the lowest slider value in game.
- 1.1 is the highest slider value in game.
- 0.6 is the default value of the slider
- 0.75 corresponds exactly to the robot waling speed


### Level Tags

You can set the level tags in Tiled. Open the map properties from the
toolbar `Map`>`Map Properties`. Using the '+' below the custom properties section, add 
a property of type `string` and call it `tags`. Write the desired tags, separating them with
comma `,`. In the game, only three tags are allowed. Using any non-existing tags will cause
an error.


### Custom Music

You can set the custom music links in Tiled. Open the map properties from the
toolbar `Map`>`Map Properties`. Using the '+' below the custom properties section, add 
a property of type `string` and call it `music_red`, `music_green` or `music_blue`. 
Paste your music link urls into these boxes. The color refers to the music block
of the same color.


## Installation

To use the tools in the current folder you will need NodeJS (google for the installer).
Then navigate to this folder using a command line.
To prepare for running type:

    npm install
This needs to be done when the project is new or has been updated.

To run type

    npm run start

For nicer instructions, see fnanfne's google doc: https://drive.google.com/file/d/1YmfD1LGdjqfsaaoUsTzDh1THV9dXwUgk/view?usp=sharing

# TODO

Not supported yet:
- exporting levels from the game into the Tiled editor format is not supported yet. The full structure of how paint is encoded is not understood yet. 
- conveyor speed setting. 
- Level Tags. 
- Custom music settings. 
