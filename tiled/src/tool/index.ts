// this is the tool that will paint beautiful maps

import {t} from "../tiled_object";
import {Point} from "../tiled_object/Point";
import {Tool} from "../tiled_object/Tool";



const PaintTool = {
    name:'kitty',
    pressed:false,
    tilePosition:{x:1,y:1} as Point,
    tilePositionChanged:function(){
        if(this!.pressed) this.executeOnCurrentPos()
    },

    isPaintable:function(){
        // t.log(Object.keys(t.mapEditor.tilesetsView.currentTileset.properties()).toString())
        return !!t.mapEditor.tilesetsView.currentTileset.properties().is_paintable
    },


    executeOnCurrentPos:function(){
        if(!this.isPaintable()) {
            t.alert("Error in script.")
            return
        }
        t.log(`Painting ${this.tilePosition?.x},${this.tilePosition?.y}`)

        // this.map.currentLayer
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

    // static updateEnabledState(){
    //     let is_paint:boolean = false
        // @ts-ignore
        // is_paint = tiled.mapEditor.tilesetsView.currentTileset.properties().paint_tileset
        // t.log(`Updated state to ${is_paint}`)
        // this.enabled = is_paint
        // if(is_paint){
        //     // @ts-ignore
        //     tiled.registerTool(PaintTool.name, PaintTool)
        // }else {
        //     // @ts-ignore
        //     tiled.registerTool(PaintTool.name, undefined)
        // }
    // }
}

// @ts-ignore
// PaintTool.name = 'kitty'

export function register(){
    t.log("Now registering Kitty paint tool.")

    // @ts-ignore
    t.registerTool('kitty paint', PaintTool)
}
