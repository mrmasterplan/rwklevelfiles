
export interface TileLayerEdit {
    setTile: (x : number, y : number, tile : Tile ) => void,
    apply:() => void,
}