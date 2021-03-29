After a question from Fnanfne about collecting statistics, I added a sniffer to grab
level statistics and save them to csv. The sniffer does not talk to the api directly.

Time for some analysis:

Is there a timestamp in the level?
- I followed the same procedure to create a simple level twice. The files are identical.
No. No timestamp in level file.
  
Is there a username in the level file?
- None found in downloaded levels

Music: Ther is a link in some levels to raptisoft.com/compose.html Mystery solved.

I really want to find out the size of the block array.

- First data point: placing up to 4 blocks left of robot in the start leaves the level 
  at 550 bytes. Placing 5 blocks the level size increases to 585 bytes. Difference: 35
  That's 8*4+3
- The 6th block right of robot also increases the level to 585 bytes. I assume that this
  is the addition of a column. If 3 bytes are per column overhead, we should have 8 blocks
  vertically to play with before the array grows.
- The 6th block placed above robot makes the file grow to 600 bytes. Difference 50 bytes.
  That's 12*4+2.
- The second block placed below robot also makes the file grow to 600 bytes.
- calling the inital robot position 0,0 blocks column from 0,-1 to 0,5 can be placed
  without growing the file. Placing 0,6 grows the file to 600.
- I want to know if the array is x,y or y,x. Try to place the top right block without growing
  the file. Try -4,5. There is a 1 at position 39.
- Placing a vertical columns makes ones appear that are spaced by 40 bytes.
  I conclude that the array is in 4 bytes per block, row after row.
- Byte 0x35 seems to equal the number of rows in the file. I made a file with more than 256 rows
  and the next byte to grow is 0x36.
- Time to write a level array size extractor.
- Ok, I can now extract and recognize the level array. I started cataloging blocks by 
  looking at the level editor tutorial. The images for the tiles are all called something
  like IMG_021.png . I wondered if there was a connection to the tile name in the game
  And it seems there is!!!
  
- It seems that the image name number minus 1 is the byte of the tile!! I have a suspicion
  the reason for the offset plus 1. The image IMG_001 seems to be the tile for the grid in 
  the level editor. A zero byte will need that tile making everyting work. Time to generate maps.
  
Status of the map generator:
- The tile information seems to be 99% contained in the last 7 bits. For many levels it is 100% correct
- In some cases the paint mixes up the state information so much that I haven't been able to to extract the block type any more
- The command line was changed to do analysis separately from extraction and injection.
  Sometimes when you are tuning the analysis you don't want to start the game up again and again.
  

  


