import {TilesetsView} from './TilesetsView'

export interface MapEditor {
    // currentBrush : TileMap,//	Get or set the currently used tile brush.
    // currentMapView : MapView,// [read‑only]	Access the current map view.
    tilesetsView : TilesetsView,// [read‑only]	Access the Tilesets view.
}