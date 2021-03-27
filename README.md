# rwklevelfiles

This is a place were we collaborate to determine the structure of Robot Wants Kitty level files. The aim is to enable future development of level editors.

# Legal Stuff

This work is in no way associated with, endorsed or supported by Raptisoft. All artwork and other parts of the game remain the property of the original copyright holder. This work was created by fans of the game without access to the original game source code. The code in this repo is published under GPLv3, see the LICENSE file.

# The Idea

RWK has recently had some updates. There is now a web version that can be played in a browser: http://www.robotwantskitty.com/web/
Using Dev Tools I discovered that the game saves custom levels in a file scructure as a byte array. There has long been a desire by the level building community to have access to more level editor features, such as map view, copy pasting sections, backups, undo etc. If we had a access to the file structure, we could create levels outside the game and format them to work in the game. 

# The Plan

I want to make use of puppeteer for nodejs to remote control the Chrome browser and navigate to the game. From there I want to create simple levels, and save their byte array and a screenshot using puppeteer. By comparing the byte changes I hope to be able to guess the structure with enough accuracy so that I can write my own level byte arrays and push them back into the browser.

## Plans for future extensions

- The iOS version includes an ability to back up levels to icloud. It is worth investigating if the level file format is the same. This would allow injecting levels to iOS devices.
- Once we have sufficient knowledge of the level structure, we should write a level editor of sorts. The simplest concept in my mind would be letting the user edit a .bmp file and a metadata file, which a script can then convert into a valid RWK level.

# File structure

Hypotheses:
1. The level is saved as a bitmap using one byte per cell. This seems like the simplest approach and is consistent with my understanding of the game mechanics (Doors, sad computer blocks, virus doors, etc.)
2. I have no idea yet how paint might be saved in the level file.
3. I expect that there are some details that are saved as fixed metadata in the level file. These include
    - Robot position
    - kitty position
    - conveyor speed
4. I have no idea how music might be saved in the level file. 
