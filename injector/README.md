# Injector
Pushes level files back into RWK 

# Installation

You will need NodeJS (google for the installer).
Then navigate to this folder using a command line.
To prepare for running type:

    npm install
This needs to be done when the project is new or has been updated.

To run type

    npm run start

# Usage

The program looks for a database to restore during startup. Otherwise startup is normal.
You now have the option to 
- start the game which gives you new options:
    - extract
    - inject
    - screenshot
- analyze the saved .kitty files. This also generates the map.
- quit

each option is selected by entering the first letter.

Extraction saves every item from the database in a file on your machine under the folder "db".
You can view and modify the files here.

Injection restores the database to the browser from you local backup. 
Injection requires reloading the game which this program will do for you.

Analysis takes the database backup, looks for .kitty files, saves them in binary in the levels/ folder
and tries to generate a map from the files.

# Background Functions

Any time you view a page in the game that has levels in it, this program will pull the level
statistics and save them in csv files. Note: This program overwrites the csv files every
time you restart the program. So back them up somewhere else.

Instructions: To collect statistics on all the levels of one author, you need to look the
levels up in-game and scroll through the entire list to the bottom. Once you did this, the
program will have collected all statistics on that author and saved them as csv.

# Configuration

You can change som parameters in the file ".env".

