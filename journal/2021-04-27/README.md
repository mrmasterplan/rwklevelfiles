I figured out that the paint is encoded in layers. A layer counter that is in the level header
always counts up and paint is added one layer higher than before. That may also be why it
does not connect to old paint.
The counter is in the high 9 bits, and at least one of these bits must be set.
actually it seems that the high 2 bytes can always be set to 0x8000 LE without conequence.
By inspection this is always the case. I will now try some level deconstructions to see
if this really works.