***This entire guid is deprecated and useless now.***

# rwklevelfiles

In this project I have reverse-engineered the structure of the level files for
the game Robot Wants Kitty. The result has been published in an extension for the
Tiled map editor to allow reading, efficient editing and writing these `.kitty`
files.

# Documentation

This project consists of two independenly usable programs.
- The `.kitty` extensions for the [Tiled map editor](https://www.mapeditor.org/)
- A [puppeteer](https://pptr.dev/) setup to get levels into and out of the web version of [Robot Wants Kitty](http://robotwantskitty.com/) 

Both are contained in this repository.

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

Note: As an alternative to using this tool, it is possible to use the ["backup to iCould"](ICLOUD.md)
functionality in the iOS version of Robot Wants Kitty to get levels out of and into the game.

## Extract

On the command line, select `e` to extract all `.kitty` levels from the browser game. This will
include all custom built levels as well as the currently playing level from the MakerMall.
All found `.kitty` levels will be copied to the foler `levels_out`.

In addition to the levels, the entire in-browser state of the game will be backed up to a file
called `db.json`. The browser game state will be restored from here on subsequent launches, this
includes settings and user login state. (To prevent this, please delete `db.json`)

## Inject

On the command line, select `i` to inject all `.kitty` files from the folder `levels_in/`
into the browser game. The browser game needs to be restarted for this.
All levels will appear under _My Levels_ including any levels that originate from the Maker Mall.

