The extractor has been deprected.
I cleaned up the injector a bit and tested it again. it woks fine
A basic flow for map making it to use these options in order:
- (s) start the game, navigate to and start the level you want to extract.
- (e) extract the database
- (a) analyze the database levels and put the results in `levels/`
- (f) fuzz the unkonwn code points and generate the tiles
- (m) make the map file. Results will be in `levels/`

I cleaned up the code a bit and removed old lines. It could still be cleaned up further.

A feature idea is to scale down all tiles before generating the map,
This could potentially greatly reduce the map size and allow generating
bigger maps.