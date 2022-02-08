# Using the Tiled extension for `.kitty` files

The tiled extension includes the following

- ability to open existing `.kitty` files. 
- ability to save levels as `.kitty` files for injecting into the game.
- The complete set of tiles necessary for working with `.kitty` levels is 
  included in the extension. They can be opened conveniently with a function
  under the Edit Menu titled "Open Kitty Tilesets"
- When working with the kitty paint tilesets, a new tool called 'kittypaint' is 
  available in the toolbar. With this tool nicely connected tiles can be painted
  similar to the in-game level editor painter. The icon for this tool is a tile from the game.
- Flipped and rotated tiles are supported. If you use flipping and want to fix the strange look, you can
  fix the flipped tiles to the correct graphics by either saving the `.kitty` file
  or select Edit ➔ Fix Kitty Map.
- A new help item has been added to quickly check which version of the extension
  you are running.

## Getting started with making levels

The recommended way to start making levels is to make basic level in the in-game
editor, [extract](#extract) it with the included tool, and then open the `.kitty` file in Tiled.

## Kitty levels in Tiled

Levels opened as `.kitty` files will contain 5 layers.

- _map_ — Use only tiles from the map tile set here. These tiles determine the state of the
  game map at the start of playing. If is possible to cheat and make the map appear
  different from the level itself.
- _base_ — This tile layer contains only blocks from the base tile set. The base type of 
  blocks determines their function in game (solid, door, etc.)
- _paint_ — This layer contains paint tiles, that determine the look of tiles in the game.
  Any block can be painted with any paint type. Feel free to experiment.
- _robot_ — This object layer contain robot and kitty. These special tiles must only appear
  once each in the level, in an object or tile layer.
- _callouts_ — This object layer contain text boxes that contain the text for the call-out 
  (aka. radio beacon) tiles. 
  The association between the tile and the text box is by the position of the first corner of the callout.

The layer structure is only a recommendation. Any tile can be placed in any layer and you can 
use as many layers as you want. However, when saving as `.kitty`, the above structure will 
re-appear since `.kitty` files don't support layers.

Apart from the layer infromation, you can find level settings in the map properties 
(Menu "Map"  ➔  "Map Properties" to open). The suppoted level settings are

- `conveyor_speed` sets the conveyor belt speed
- `music_red`, `_green`, `_blue` set the link to the custom music
- `tags` sets a comma-separated list of level tags.

### Tiled setup

It is recommended that you set Tiled to snap everything to the grid when working 
tile layers. 
Do this under _View_ ➔ _Snapping_ ➔ _Snap to grid_.


### Robot and Kitty

Robot and kitty are special tiles in the tileset called `robot`. Placing any more than one of each 
will not work. Robot and kitty do not need to be placed in the grid.
If you turn off snapping to grid, and use an Object Layer (like for callouts), you can add the two
on boundaries, or outside the cell grid.

### Conveyor speed

You can set the conveyor speed for the level in Tiled. Open the map properties from the
toolbar _Map_ ➔ _Map Properties_. Using the '+' below the custom properties section, add 
a property of type `float` and call it `conveyor_speed`. Change this value to the desired
conveyor speed in the game.
- 0.1 is the lowest slider value in game.
- 1.1 is the highest slider value in game.
- 0.6 is the default value of the slider
- 0.75 corresponds exactly to the robot walking speed

Other speed values are possible.

### Level Tags

You can set the level tags in Tiled. Open the map properties from the
toolbar _Map_ ➔ _Map Properties_. Using the '+' below the custom properties section, add 
a property of type `string` and call it `tags`. Write the desired tags, separating them with
comma `,`. In the game, only three tags are allowed. Using any non-existing tags will cause
an error.


### Custom Music

You can set the custom music links in Tiled. Open the map properties from the
toolbar _Map_ ➔ _Map Properties_. Using the '+' below the custom properties section, add 
a property of type `string` and call it `music_red`, `music_green` or `music_blue`. 
Paste your music link urls into these boxes. The color refers to the music block
of the same color.
