I figured out how robot and kitty positions are encoded.
They are FloatLE values in pixels from the top-left corner of the grid, x, then y.

Here is the plan: Add a "kind" property to every tile with the possible values:
- base
- paint
- combined
- robot
- kitty

the robot and kitty tiles will be added to the base-set.
(the purpose of the combined tile will be in level extraction.)
Robot and Kitty tiles have no byte values and will be treated completely differently.
They can only be added to an object layer, like callouts.

A challenge is the extraction of their tiles. For this, a special level has them 
in front of a background of "alu" which is bright and plain.
Fuzz the level, take a screenshot, cut out the robot and kitty at known positions.
Then manipulate the pixel data, where every pixel that has the alu color is set to 100% transparent.

Future extension: Extracting levels to Tiled format will work like this: 
Extracted tiles will be treated based on their encoding. Tiles with a known type in 0x7f will be split
into base and paint tiles in one layer each. Tiles where this does not work, will be treated as combined tiles
in a special layer.
All non-standard paint tiles and combined tiles will be added to an embedded custom tileset. The values will be added 
to a fuzzing database and, in case any are missing, fuzzing is recommended to the user.
