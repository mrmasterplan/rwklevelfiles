

interface Tile {
    id : number ,//[read‑only]	ID of this tile within its tileset.
    width : number ,//[read‑only]	Width of the tile in pixels.
    height : number ,//[read‑only]	Height of the tile in pixels.
    // size : size [read‑only]	Size of the tile in pixels.
    type : string,//	Type of the tile.
    imageFileName : string,//	File name of the tile image (when the tile is part of an image collection tileset).
    probability : number,//	Probability that the tile gets chosen relative to other tiles.
    // objectGroup : ObjectGroup,//	The ObjectGroup associated with the tile in case collision shapes were defined. Returns null if no collision shapes were defined for this tile.
    // frames : [frame]	This tile’s animation as an array of frames.
    // animated : bool [read‑only]	Indicates whether this tile is animated.
    // tileset : Tileset,// [read‑only]
    properties:()=>{[key:string]:boolean|number|string}
}