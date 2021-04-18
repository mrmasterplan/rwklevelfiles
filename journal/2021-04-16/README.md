the tags are a bit field following directly after the terminating zero of the name.
There are 14 tags and they are, in little endian order from lsb to msb:
- kids
- easy
- hard
- insane
- tricky
- silly
- arcade
- prank
- unfair
- evil
- rpg
- tiny
- huge
- glitchy

I confirmed (by uploading an impossible level) that it IS possible to fake the 1up and the winnable setting in the .kitty file.
I will now forever not touch that stuff any more.

Conveyor speeds are saved as a repleated single precision float near the end end of the level. Slider settings are from 0.1 to 1.1. Setting other float values works.
A speed of 0.75 seems to correspond to the robot walking speed.