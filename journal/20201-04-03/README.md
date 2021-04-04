- I conducted an experiment: I made a level with rows of each paintable block.
  I painted the blocks with all the same paint tile. I looked at the hex. The almost
  all had different code points. I changed the hex to cleanly separate the block byte
  from the paint bytes. Gave them all a clean block byte and the same three paint bytes.
  The level looked identical and the function was not affected.
- Conclusion: Whatever extra information is in those bytes doesn't matter!!!
- This therefore allows us to create a tile set with the necessay information in it,
  make a level with it, and make it playable.
  