# Documentation

This project consists of two independenly usable programs.
- The `.kitty` extensions for the [Tiled map editor](https://www.mapeditor.org/)
- A [puppeteer](https://pptr.dev/) setup to get levels into and out of the web version of [Robot Wants Kitty](http://robotwantskitty.com/) 

# Installation

You will need these dependiencies:
- [Tiled editor](https://www.mapeditor.org/)
- [NodeJS](https://nodejs.org/)
- Git version control

To build both software parts, clone the project and run 

    npm install

After installing the necessary packages, scripts will be launched that do the following:
- compile and assemble the tiled extension into a single js file.
- compile the puppeteer tool to javascript
- (after confirmation) a the 'fuzzer' will launch, which loads test levels into the game and screenshots them to get the tile graphics.
- the tiled extension will be packaged for installation in a directory called `rwk/`
- (after another confirmation) the extension will be copied to the global extension directory of the Tiled editor.

## Uninstall

To uninstall, open the Tiled extension folder (in Tiled go to Menu Edit=>Preferences=>Plugins then click to open the extension directory).
In this directory delete the folder `rwk/`.

Finally, simply delete the folder where you cloned this project.

This concludes all uninstallation steps.

# Using the puppeteer tool

From the command line, launch

    npm run start

The game will be lauched in a browser. You can interact with it as normal.

Note: As an alternative to using this tool, it is possible to use the "backup to iCould"
functionality in the iOS version of Robot Wants Kitty to get levels out of and into the game.

## Extract

On the command line, select `e` to extract all `.kitty` levels from the browser game. This will
include all custom built levels as well as the currently playing level from the MakerMall.
All found `.kitty` levels will be copied to the foler `levels_out`.

In addition to the levels, the entire in-browser state of the game will be backed up to a file
called `db.json`. The browser game state will be restored from here on subsequent launches, this
includes settings and user login state. (To prevent this, please delete `db.json`)

## Inject

n the command line, select `i` to inject all `.kitty` files from the folder `levels_in/`
into the browser game. The browser game needs to be restarted for this.

# Using the Tiled extension for `.kitty` files

The tiled extension includes the following

- ability to open existing `.kitty` files. For example, levels extracted from 
  the MakerMall can be viewed in the Tiled editor like this.
- ability to save levels as `.kitty` files for injecting into the game.
- The complete set of tiles necessary for working with `.kitty` levels is 
  included in the extension. They can be opened conveniently with a function
  under the Edit Menu titled "Open Kitty Tilesets"
- When working with the kitty paint tilesets, a new tool called 'kittypaint' is 
  available in the toolbar. With this tool nicely connected tiles can be painted
  similar to the in-game level editor painter.

## Getting started with making levels

The recommended way to start making levels is to make basic level in the in-game
editor, [extract](#extract) it with the included tool, and then open the `.kitty` file in Tiled.

## Kitty levels in Tiled

Levels opened as '.kitty' files will contain 5 layers.

- map -- Use only tiles from the map tile set here. These tiles determine the state of the
  game map at the start of playing. If is possible to cheat and make the map appear
  different from the level itself.
- base -- This tile layer contains only blocks from the base tile set. The base type of 
  blocks determines their function in game (solid, door, etc.)
- paint -- This layer contains paint tiles, that determine the look of tiles in the game.
  Every block can be painted with any paint type. Feel free to experiment.
- robot -- This object layer contain robot and kitty. These special tiles must only appear
  once each in the level, in an object or tile layer.
- callouts -- This object layer contain text boxes that contain the text for the call-out 
  (aka. radio beacon) tiles. The association between the tile and the text box is by position.

The layer structure is only a recommendation. Any tile can be placed in any layer and you can 
use as many layers as you want. However, when saving as `.kitty`, the above structure will 
re-appear since `.kitty` files don't support layers.

Apart from the layer infromation, you can find level settings in the map properties 
(Menu "Map" => "Map Properties" to open). The suppoted level settings are

- `conveyor_speed` sets the conveyor belt speed
- `music_red`, `_green`, `_blue` set the link to the custom music
- `tags` sets a comma-separated list of level tags.

### Tiled setup

It is recommended that you set Tiled to snap everything to the grid when working 
tile layers. 
Do this under view>Snapping>Snap to grid.


### Robot and Kitty

Robot and kitty are special tiles in the tileset called `robot`. Placing any more than one of each 
will not work. Robot and kitty do not need to be placed in the grid.
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
- 0.75 corresponds exactly to the robot walking speed

Other speed values are possible.

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
