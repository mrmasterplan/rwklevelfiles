import {Tile} from './Tile'
import {Tileset} from './Tileset'

export interface TilesetsView {
    currentTileset : Tileset,//	Access or change the currently displayed tileset.
    selectedTiles : Tile[],//	A list of the tiles that are selected in the current tileset.
}