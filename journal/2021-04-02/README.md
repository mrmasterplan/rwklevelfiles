- Looking at the size of the footer as the level grows has shown that there must be
  an additional array of one byte per cell. I don't yet know exactly were it is located
  or what it encodes. My suspicion was that it has something to do with radio callouts.
  I tested this hypothesis by having two levels with the same callout in diffenent locations
  If the theory were correct I would have expected the callout text to move in the byte-array.
  It dind't though. :(
- theory: grid array plus 80 cells, 1 callout, (0x13?), index0,  referring to cell x,y,3 bytes, 'ho'
  0x13 could be size of (index0,  referring to cell x,y,3 bytes, 'ho')
  To test: Move to cell 2,2, same callout
- checked with two callouts. the grid-array plus 80 next number is still 1. Possibly name of field.
  new theory: the grid-array plus 80 next number always 01. Then comes the size of the callout
  field in total for the following: 
   - number of callouts
   - for each callout:
     - x coord of callout
     - y coord of callout
     - nbytes in callout
     - bytes of text

- callout deciphering done. Next I want to figure out what is in the post-grid.
- I found one level so far that has any data in the field: codebreaker too easy by JamesH
- All other levels are zero here.
- in codebreaker, there is some correlation between 0 in both grids, but not complete.
- a lot of similar values are grouped
- no real clue yet.

- move on to kitty position
- kitty position is just strange. The values make no sense to me.

- Plan to a level editor: If we assume that the different paint code points don't matter
  and the postgrid dosn't matter.
  We could create a few tile-sets for the tiled editor where base block
  is supposed to be used in one layer, and paint is supposed to be used in another.
  callouts can be done as text objects in an object layer.
  Then we could make some tools that enforce consistency somewhat.
  Then an external tool could probably grab them, transform them into a meaningful level
  and then it would be playable.
  