
# File structure

For a detailed run-down of how the data is encoded, please read the 
file [level.ts](../src/level.ts)

Kitty files contain the following information:
- MakerMall level index (not implemented)
- Level name
- winnability (not implemented)
- 1-up (not implemented)
- bit whether the "win without dying to get 1-up"-banner has been shown (not implemented)
- paint layer counter (not implemented)
- level grid size x and y
- level grid 4 bytes per cell
    - Each cell is 4 bytes. The bytes are packed
      with information. The lowest 7 bits are the base type. The next 9 bits are
      the paint. The highest 9 bits are a counter that increases with each layer
      of paint. Of the remaining 7 bits, two are used for spring shaft vs top.
      The rest I don't know, may be unused.
      For my work, I just reset the counter to 1 (mustn't be 0) for every cell,
      and it works.
      there are 47 types of paint for each style
      (http://www.cr31.co.uk/stagecast/wang/blob.html) and there are 10 types of
      paint. That is 470 tiles to encode in only 9 bits which have 512
      possibilities (511 actually since 0 is no paint).
      There would not have been space for an 11th paint in there.
- the map grid 1 byte per cell (this is not settable in the in-game editor at all.)
  - the map grid code is equals to the base type code
- the call-out texts referenced to tile grid coordinates.
- the robot and kitty positions as floating point pixel coordinates x,y. (using 40px as the tile size)


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
    - after the end of the main cell array there follows immediately another array of 1 byte per cell
      the contents of this array is assumed to relate to the cells, but it is not clear what it contains.
    - following this, there is a structure that describes the callout texts. each callout is referenced by coordinate in the cell array
    - the next section contains the robot and kitty positions.
    - the final section contains the links to the music.
   
   
  
