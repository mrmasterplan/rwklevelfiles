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

What we know:
- A level file is comprised of a header, the cell array, and a footer.
- The serialization format does not use a table of contents. We know this because
  the level name is a variable length string in the header and nothing else changes
  when this name grows. All the following bytes just move along.
- The file uses little endian byte ordering.
- the cell array
   - The cell array is saved row after row.
   - The size of the array is recorded in the header that is before the array
   - each cell is recorded in 4 bytes.
   - for unpainted cells, the lowest 7 bits record all necessary information.
     Below I will refer to the type-byte and the three paint-bytes, but note that
     this is not correct, as we have seen.
   - painted cells use all 4 bytes.
   - some relationships exist between painted cells such as differences of +-1 in
     the three high bytes referring to cells of adjacent orientations.
   - there are cells with identical look and function, but different paint bytes.
   - in some cases the paint information changes the type-byte, but not by single 
     bit differences. That means that for painted cells the type can not reliably
     be extracted from the type-byte.
   - Hypotheses as to the variablility:
      - maybe there is more information saved beyond the type and paint.
      - maybe there are tiny differences in the optical apprearance and the game
        intentionally randomizes them to make it more visually interesting.
- the header
   - The header is of fixed size besides the length of the level name.
   - Contents of the header:
      - the array width and height.
      - the name
      - level winnability (assumed)
      - conveyor speed (assumed)
      - level tags (assumed)
- the footer 
   - The level footer grows with the size of the level.
   - We currently don't know how to read anything in the footer
   - The footer contains (but we don't know how)
      - Robot position
      - kitty position
      - links to the tunes that each of the music boxes refer to
      - the radio callout texts
   
   
  

Hypotheses:
1. The level is saved as a bitmap using one byte per cell. This seems like the simplest approach and is consistent with my understanding of the game mechanics (Doors, sad computer blocks, virus doors, etc.)
2. I have no idea yet how paint might be saved in the level file.
3. I expect that there are some details that are saved as fixed metadata in the level file. These include
    - Robot position
    - kitty position
    - conveyor speed
4. I have no idea how music might be saved in the level file. 
