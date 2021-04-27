import {Layer} from "./Layer";

export interface TileMap {
    // width : int	Width of the map in tiles (only relevant for non-infinite maps).
    // height : int	Height of the map in tiles (only relevant for non-infinite maps).
    // size : size [read‑only]	Size of the map in tiles (only relevant for non-infinite maps).
    // tileWidth : int	Tile width (used by tile layers).
    // tileHeight : int	Tile height (used by tile layers).
    // infinite : bool	Whether this map is infinite.
    // hexSideLength : int	Length of the side of a hexagonal tile (used by tile layers on hexagonal maps).
    // staggerAxis : StaggerAxis	For staggered and hexagonal maps, determines which axis (X or Y) is staggered.
    // orientation : Orientation	General map orientation
    // renderOrder : RenderOrder	Tile rendering order (only implemented for orthogonal maps)
    // staggerIndex : StaggerIndex	For staggered and hexagonal maps, determines whether the even or odd indexes along the staggered axis are shifted.
    // backgroundColor : color	Background color of the map.
    // layerDataFormat : LayerDataFormat	The format in which the layer data is stored, taken into account by TMX, JSON and Lua map formats.
    // layerCount : int [read‑only]	Number of top-level layers the map has.
    // tilesets : [Tileset]	The list of tilesets referenced by this map. To determine which tilesets are actually used, call usedTilesets().
    // selectedArea : SelectionArea	The selected area of tiles.
    currentLayer : Layer,//	The current layer.
    // selectedLayers : [Layer]	Selected layers.
    // selectedObjects : [MapObject]	Selected objects.
}