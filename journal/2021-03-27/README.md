THe fist step is to extract anything at all from the game. 
First step: manual.
In Chrome, open De Dev tools, reload the game. Go to maker Mall, create new level, call it "1".
In Dev Tools, go to application tab, Storage > IndexedDB 
There is now a file called /RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/1.kitty
The "1" in the file name is the level name. I checked.
The standard level with zero manual changes is 549 bytes plus the length of the level name.

My first step is to create a NodeJS TypeScript project to pull this file out using puppeteer.
