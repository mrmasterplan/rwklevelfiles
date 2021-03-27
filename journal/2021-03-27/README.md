THe fist step is to extract anything at all from the game. 
First step: manual.
In Chrome, open De Dev tools, reload the game. Go to maker Mall, create new level, call it "1".
In Dev Tools, go to application tab, Storage > IndexedDB 
There is now a file called /RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/1.kitty
The "1" in the file name is the level name. I checked.
The standard level with zero manual changes is 549 bytes plus the length of the level name.

My first step is to create a NodeJS TypeScript project to pull this file out using puppeteer.
The tool will be called the extractor for now and lives on the top level.

I finished the level extractor. I can now start a collection of levels. to compare them.

I made three levels '1', '2' and '3'.
Initial analysis:

- The difference between 1 and 2 is that there is a line of 9 cells in 2. The hex files show that 9 ones appear where there is a field of zeros in level 1.
- the ones are separated in blocks of 4 bytes.
- in level 3 the blocks were painted. The pain of each end is different, and the middle bits are again different.
  The hex file shows that the ones from level 2 are still present but followed by additional information.
  The additional information follows the pattern expected. Both ends different and different from the middle bits.
  
All in all this looks very promising. It looks like each level cell is saved in 4 bytes. Assumption: 1 byte block type and 3 bytes paint.
The extra bytes may contain more than just paint info. We'll see.
