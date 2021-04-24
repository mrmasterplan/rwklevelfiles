import {TileLayerEdit} from "./TileLayerEdit";

export interface Layer{
    // id : int [read‑only]	Unique (map-wide) ID of the layer (since Tiled 1.5).
    name : string,//	Name of the layer.
    // opacity : number	Opacity of the layer, from 0 (fully transparent) to 1 (fully opaque).
    visible : boolean,//	Whether the layer is visible (affects child layer visibility for group layers).
    // locked : bool	Whether the layer is locked (affects whether child layers are locked for group layers).
    // offset : point	Offset in pixels that is applied when this layer is rendered.
    // parallaxFactor : point	The parallax factor of the layer (since Tiled 1.5).
    // map : TileMap [read‑only]	Map that this layer is part of (or null in case of a standalone layer).
    // parentLayer : GroupLayer [read‑only]	The parent group layer, if any.
    // selected : bool	Whether the layer is selected.
    isTileLayer : boolean,// [read‑only]	Whether this layer is a TileLayer.
    // isObjectLayer : bool [read‑only]	Whether this layer is an ObjectGroup.
    // isGroupLayer : bool [read‑only]	Whether this layer is a GroupLayer.
    // isImageLayer : bool [read‑only]	Whether this layer is an ImageLayer.
    tileAt: (x : number, y : number)=> Tile,
    edit: () => TileLayerEdit,

}