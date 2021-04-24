// this is the tool that will paint beautiful maps

import {t} from "../tiled_object";
import {Point} from "../tiled_object/Point";
import {Tool} from "../tiled_object/Tool";
import {Layer} from "../tiled_object/Layer";



const PaintTool = {
    name:'kitty paint',
    pressed:false,

    pos: function():Point{
        // @ts-ignore
        return this.tilePosition
    },

    tilePositionChanged:function(){
        if(this!.pressed) this.executeOnCurrentPos()
    },



    isPaintable:function(){
        // t.log(Object.keys(t.mapEditor.tilesetsView.currentTileset.properties()).toString())
        return !!t.mapEditor.tilesetsView.currentTileset.properties().is_paintable
    },

    layer: function():Layer{

        let istile:boolean
        let layer:Layer
        // @ts-ignore
        layer = this.map.currentLayer

        if(!layer.isTileLayer) t.alert("can only use kitty paint tool on tile layer.")

        return layer
    },

    cleanPaintGrid:function(grid:string):string{
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
    },

    parsed_tileset:function (){
      const tile_dict:{[grid:string]:Tile}={}
      for(let tile of t.mapEditor.tilesetsView.currentTileset.tiles){
          tile_dict[this.cleanPaintGrid(tile.properties().paint_grid.toString())]=tile
      }
      return tile_dict
    },

    tilesetAt:function(x:number,y:number){
        return this.layer().tileAt(x,y)?.tileset
    },

    updateTileAt:function(x:number,y:number){
        const tileset = t.mapEditor.tilesetsView.currentTileset


        // grab the state of the surrounding tiles
        let state:string[]=[]
        this.layer().tileAt(x-1,y-1)?.tileset.name==tileset.name?state.push("1"):state.push("0")
        this.layer().tileAt(x+0,y-1)?.tileset.name==tileset.name?state.push("1"):state.push("0")
        this.layer().tileAt(x+1,y-1)?.tileset.name==tileset.name?state.push("1"):state.push("0")
        this.layer().tileAt(x-1,y)?.tileset.name==tileset.name?state.push("1"):state.push("0")
        this.layer().tileAt(x+1,y)?.tileset.name==tileset.name?state.push("1"):state.push("0")
        this.layer().tileAt(x-1,y+1)?.tileset.name==tileset.name?state.push("1"):state.push("0")
        this.layer().tileAt(x+0,y+1)?.tileset.name==tileset.name?state.push("1"):state.push("0")
        this.layer().tileAt(x+1,y+1)?.tileset.name==tileset.name?state.push("1"):state.push("0")

        const raw_grid = state.join("")
        const paint_grid = this.cleanPaintGrid(raw_grid)
        t.log(`Painting ${x},${y}: raw:${raw_grid}, grid ${paint_grid}`)

        const tile = this.parsed_tileset()[paint_grid]

        const editable = this.layer().edit()
        editable.setTile(x,y,tile)
        editable.apply()
    },

    executeOnCurrentPos:function(){
        t.log("=================")
        const {x,y} = this.pos()
        t.log(`Now operating on ${x},${y}`)

        if(!this.isPaintable()) {
            t.alert("Error in script.")
            return
        }

        const tileset = t.mapEditor.tilesetsView.currentTileset


        // t.log(`Painting ${x},${y}`)

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
                    t.log(`Neighbor at ${xi},${yi} also needs updating.`)
                    this.updateTileAt(xi,yi)
                }

            }
                    // }
                // || (this.tilesetAt(xi,yi)?.name == tileset.name))
                //     this.updateTileAt(xi,yi)

    },

    getLayer: function(){
        //
        // return this.map.currentLayer
    },
    mousePressed: function(){
        if(!this.isPaintable()){
            t.alert("Current tileset is not a paint tileset. Tool will not work.","Warning")
            return
        }
        this.pressed = true
        this.executeOnCurrentPos()
    },

    mouseReleased: function(){
        this.pressed = false
    }


}

export function register(){
    t.log("Now registering Kitty paint tool.")

    // @ts-ignore
    t.registerTool('kitty paint', PaintTool)
}
