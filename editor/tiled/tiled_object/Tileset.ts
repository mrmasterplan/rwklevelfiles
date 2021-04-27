import {Tile} from './Tile'

export interface Tileset {
    name : string,//	Name of the tileset.
    image : string,//	The file name of the image used by this tileset. Empty in case of image collection tilesets.
    tiles : Tile[],// [read‑only]	Array of all tiles in this tileset. Note that the index of a tile in this array does not always match with its ID.
    // wangSets : [WangSet] [read‑only]	Array of all Wang sets in this tileset.
    tileCount : number,//int	The number of tiles in this tileset.
    // nextTileId : int	The ID of the next tile that would be added to this tileset. All existing tiles have IDs that are lower than this ID.
    tileWidth : number,//	Tile width for tiles in this tileset in pixels.
    tileHeight : number,//	Tile Height for tiles in this tileset in pixels.
    // tileSize : size	Tile size for tiles in this tileset in pixels.
    imageWidth : number,//int [read‑only]	Width of the tileset image in pixels.
    imageHeight : number,//int [read‑only]	Height of the tileset image in pixels.
    // imageSize : size [read‑only]	Size of the tileset image in pixels.
    // tileSpacing : int [read‑only]	Spacing between tiles in this tileset in pixels.
    // margin : int [read‑only]	Margin around the tileset in pixels (only used at the top and left sides of the tileset image).
    // objectAlignment : Alignment	The alignment to use for tile objects (when Unspecified, uses Bottom alignment on isometric maps and BottomLeft alignment for all other maps).
    // tileOffset : point	Offset in pixels that is applied when tiles from this tileset are rendered.
    // orientation : Orientation	The orientation of this tileset (used when rendering overlays and in the tile collision editor).
    // backgroundColor : color	Background color for this tileset in the Tilesets view.
    // isCollection : bool [read‑only]	Whether this tileset is a collection of images (same as checking whether image is an empty string).
    // selectedTiles : [Tile]	Selected tiles (in the tileset editor).
    properties:()=>{[key:string]:boolean|number|string}
}