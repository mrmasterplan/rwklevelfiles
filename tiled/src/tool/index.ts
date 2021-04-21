// this is the tool that will paint beautiful maps

import * as t from "../tiled_object";



class PaintTool {
    name= "Nice Painter"
    static pressed=false
    static tilePosition:t.Point
    static enabled:boolean = false

    static tilePositionChanged(){
        if(this.pressed) this.executeOnCurrentPos()
    }

    static isPaintable(){
        let is_paint:boolean = false
        // @ts-ignore
        is_paint = tiled.mapEditor.tilesetsView.currentTileset.properties().paint_tileset
        return is_paint
    }

    static executeOnCurrentPos(){

        if (this.isPaintable())
            t.log(`Painting ${this.tilePosition.x},${this.tilePosition.y}`)
        else
            t.log(`Not Painting. Not a paint tileset.`)
    }

    static mousePressed(){
        if(!this.isPaintable()){
            // @ts-ignore
            tiled.alert("Current tileset is not a paint tileset. Tool will not work.","Warning")
            return
        }
        this.pressed = true
        this.executeOnCurrentPos()
    }
    static mouseReleased (){
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
tiled.registerTool(PaintTool.name, PaintTool)