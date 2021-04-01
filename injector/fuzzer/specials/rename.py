import os
# To get transparency in the livel maps, we need better tiles of transparent items than we can ger by screenshotting the game.
# Download all the tiles from the tutorial tile list http://robotwantskitty.com/tutorial/ and put them in this folder
# Then run this renaming script to make them useful for map-making.

for i in range(99):
    file = f"IMG_{i:03}.png"
    if(not os.path.exists(file)):
        continue
    newname = f"{i-1:02x}000000.png"
    os.rename(file,newname)

