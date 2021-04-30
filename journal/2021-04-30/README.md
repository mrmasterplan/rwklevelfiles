Let me tell you about the paint: Each cell is 4 bytes. The bytes are packed 
with information. The lowest 7 bits are the base type. the next 9 bits are 
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

All the tile encodings just count through the values continuously and 
follow one after the other without gap. That's how I was able to identify 
the missing tile codes - they are the only gaps.