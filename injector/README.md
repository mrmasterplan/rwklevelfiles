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
- extract
- inject
- screenshot
- quit

each option is selected by entering the first letter. The default is to quit.

Extraction saves every item from the database in a file on your machine under the folder "db".
You can view and modify the files here.

Injection restores the database to the browser from you local backup. 
Injection requires reloading the game which this program will do for you.



