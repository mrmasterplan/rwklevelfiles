

interface kittypaint_type extends Tool {
    icon:string
    pressed:boolean
    isPaintable():boolean
    executeOnCurrentPos():void
    layer():TileLayer
    updateTileAt(x:number,y:number):void

}

const kittypaint = {} as kittypaint_type

kittypaint.name = 'kittypaint'

// // Restore this when issue is resolved: https://github.com/mapeditor/tiled/issues/3048
kittypaint.icon = 'rwk/tiles/80be8000.png'

kittypaint.activated = function(){
    if(!this.isPaintable()) return
}

kittypaint.isPaintable=()=>{
    const paintable = !!tiled.mapEditor.tilesetsView.currentTileset?.property("is_paintable")
    if(!paintable) {
        tiled.alert("Current tileset is not a paint tileset. Kittypaint will not work.","Warning")
        tiled.trigger("StampTool")
    }
    return paintable
}

export function parsed_tileset(set:Tileset) {
    let tile_dict: {
        [name: string]: { [grid: string]: Tile }
    } = {}
    // @ts-ignore // assign globally
    tile_dict =  tiled.__parsed_kitty_tilesets || {}

    if(!tile_dict[set.name]){
        tile_dict[set.name]={}
        for(let tile of set.tiles){
            if(!tile) continue
            const grid = tile.resolvedProperty('paint_grid')
            if (!grid) continue
            tile_dict[set.name][cleanPaintGrid(grid.toString())]=tile
        }
        // @ts-ignore // assign globally
        tiled.__parsed_kitty_tilesets = tile_dict
    }

    return tile_dict[set.name]
}
export function parsed_base_tileset(set:Tileset) {
    let tile_dict: {
        [name: string]: { [index: number]: Tile }
    } = {}
    // @ts-ignore // assign globally
    tile_dict =  tiled.__parsed_kitty_tilesets || {}

    if(!tile_dict[set.name]){
        tile_dict[set.name]={}
        for(let tile of set.tiles){
            if(!tile) continue
            const index = (tile.resolvedProperty('base') || tile.resolvedProperty('map')) as number
            if (!index) continue
            tile_dict[set.name][index]=tile
        }
        // @ts-ignore // assign globally
        tiled.__parsed_kitty_tilesets = tile_dict
    }

    return tile_dict[set.name]
}



export function cleanPaintGrid(grid:string):string{
    // reminder, the paint grid is the state of the neighboring cells.
    // top row, then left, the right, then bottom row. 8 in total.
    // a 1 indicates that it is of the same paint type, a 0 that it is not

    const parts = grid.split("").map(s=>+s)

    // cleaning consists of nulling the corners when they don't matter.
    // a corner does not matter if either of its neighbors are "0"

    if(!parts[1] || !parts[3]) parts[0]=0 //top left
    if(!parts[1] || !parts[4]) parts[2]=0 //top right
    if(!parts[6] || !parts[3]) parts[5]=0 //bottom left
    if(!parts[6] || !parts[4]) parts[7]=0 //bottom right

    return parts.map(i=>i.toString()).join("")
}

kittypaint.layer= function(){

    const layer:Layer|TileLayer = this.map.currentLayer

    if(!layer.isTileLayer || ! ('tileAt' in layer)) {
        tiled.alert("can only use kitty paint tool on tile layer.")
        throw new Error("can only use kitty paint tool on tile layer.")
    }

    return layer as TileLayer
}

kittypaint.tilePositionChanged = function(){
    if(this!.pressed) this.executeOnCurrentPos()
}

kittypaint.mousePressed= function(){

    if(!this.isPaintable()) return
    this.pressed = true
    this.executeOnCurrentPos()
}

kittypaint.mouseReleased= function(){
    this.pressed = false
}

kittypaint.executeOnCurrentPos=function(){
    // tiled.log("=================")
    const {x,y} = this.tilePosition
    // tiled.log(`Now operating on ${x},${y}`)

    if(!this.isPaintable()) {
        throw new Error("Error in script.")
    }

    const tileset = tiled.mapEditor.tilesetsView.currentTileset


    // tiled.log(`Painting ${x},${y}`)

    // first update the current one
    this.updateTileAt(x,y)

    // then check if any of the neighbors are of the same type and update those also
    for(let xi=x-1;xi<x+2;xi+=1)
        for(let yi=y-1;yi<y+2;yi+=1) {
            if (xi == x && yi == y) {
                continue
            }
            // check if the cell at xi, yi needs updating
            const other_tile = this.layer().tileAt(xi,yi)
            if(!other_tile) continue
            const other_tileset = other_tile.tileset
            if(other_tileset.name===tileset.name){
                // tiled.log(`Neighbor at ${xi},${yi} also needs updating.`)
                this.updateTileAt(xi,yi)
            }

        }
    // }
    // || (this.tilesetAt(xi,yi)?.name == tileset.name))
    //     this.updateTileAt(xi,yi)

}

kittypaint.updateTileAt=function(x:number,y:number){
    const tileset = tiled.mapEditor.tilesetsView.currentTileset


    // grab the state of the surrounding tiles
    let state:boolean[]=[]
    state.push(this.layer().tileAt(x-1,y-1)?.tileset.name==tileset.name)
    state.push(this.layer().tileAt(x+0,y-1)?.tileset.name==tileset.name)
    state.push(this.layer().tileAt(x+1,y-1)?.tileset.name==tileset.name)
    state.push(this.layer().tileAt(x-1,y)?.tileset.name==tileset.name)
    state.push(this.layer().tileAt(x+1,y)?.tileset.name==tileset.name)
    state.push(this.layer().tileAt(x-1,y+1)?.tileset.name==tileset.name)
    state.push(this.layer().tileAt(x+0,y+1)?.tileset.name==tileset.name)
    state.push(this.layer().tileAt(x+1,y+1)?.tileset.name==tileset.name)

    const raw_grid = state.map(b=>(+b).toString()).join("")
    const paint_grid = cleanPaintGrid(raw_grid)
    // tiled.log(`Painting ${x},${y}: raw:${raw_grid}, grid ${paint_grid}`)

    const tile = parsed_tileset(tileset)[paint_grid]

    const editable = this.layer().edit()
    editable.setTile(x,y,tile)
    editable.apply()
}



export function register(){
    tiled.log("Now registering Kitty Paint tool.")
    tiled.registerTool(kittypaint.name,kittypaint)

}