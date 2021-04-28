# rwklevelfiles

In this project I have reverse-engineered the structure of the level files for
the game Robot Wants Kitty. The result has been published in an extension for the
Tiled map editor to allow reading, efficient editing and writing these `.kitty`
files.


# Legal Stuff

This work is in no way associated with, endorsed or supported by Raptisoft. All 
artwork and other parts of the game remain the property of the original copyright
holder. This work was created by fans of the game without access to the original 
game source code. The code in this repo is published under GPLv3, see the LICENSE 
file.

# Docs
For detailed instructions on how to install and use the extension or how to publish
levels, please review [the Documentation](docs/README.md).

# Quick Start

First, install the dependencies:
- [Tiled editor](https://www.mapeditor.org/)
- [NodeJS](https://nodejs.org/)
- Git version control

Then build this project by opening a console and entering

    git clone https://github.com/MrMasterplan/rwklevelfiles.git
    cd rwklevelfiles
    npm install

Follow the instruction on screen.

You can now open and save `.kitty` files from the Tiled editor. One way to get
them in and out of the game is to use the iCloud backup functionality. 