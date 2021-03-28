Interesting note: Starting a level from the maker mall makes a file called download.kitty appear.
Maybe we can push that back as a custom level.

I can routinely extract level files, and they look not too complicated.
I really want to be able to test hypotheses and upload levels back into the game. I call that injecting.
The next step is therefore to create a desired state of the database before the game loads.

I was thinking about how to save level editing progress in the back-end. Here is a way: 
- create your level and put robot and kitty together. Thus it is trivially winnable.
- save the level under a temporary name. Publish the level.
- you can now download and play the level and pull it out of the DB


PROGRESS!!!

I can now successfully back up the state of the entire database and restore it!!

Also, the downloaded.kitty level can be copied to the custom level section (/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/)
and can be edited from there. 
See the screenshot which shows the level "lost cat" by delphine53.

I have cleaned up the program for publishing.

Note: To make the downloaded.kitty into an editable level, the file name needs to match the 
level name in the file itself. In the future I may make a program that does this automatically.
