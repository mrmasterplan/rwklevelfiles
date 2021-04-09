# Musings on Robots Positon

Ok, we have the level editor published and are
waiting for a response from raptisoft on 
paint encoding and robot position.

What we already know:
In the level structure there is the main cell data, followed by the callout section. After that,
there are two fileds of 8 bytes each. These are assumed to hold robot and kitty positions repectively.

- Observation 1: Playing with the value of robots position, we can make robot appear at not a full cell center. This strengthens the assumption that 
this position is not in cell array indices.
- Observation 2: Putting robot and kitty in cell 0,0 and then repeating this with a different size grid gives
the same robot and kitty position bytes. Hence we can assume that positions are measured from top left.

Study 1:
- Robot at 0,0: A041: LEdec: 16800
- Robot at 1,0: 7042: LEdec: 17008
- Robot at 2,0: C842: LEdec: 17096

These steps are not equal. Hence we can rule out a linear relationship in the assumed encoding scheme.
Try: BE encoding.
- 0,0: BEdec: 41025
- 1,0: BEdec: 28738
- 2,0: BEdec: 51266
Also no linear stepping.