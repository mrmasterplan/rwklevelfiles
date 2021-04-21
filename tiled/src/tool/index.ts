// this is the tool that will paint beautiful maps

import {tiled} from "../tiled_object";
import {Point} from "../tiled_object/Point";



class PaintTool {
    name= "Nice Painter"
    static pressed=false
    static tilePosition:Point
    static enabled:boolean = false

    static tilePositionChanged(){
        if(this.pressed) this.executeOnCurrentPos()
    }

    static isPaintable():boolean{

        return !!tiled.mapEditor.tilesetsView.currentTileset.properties().paint_tileset
    }

    static executeOnCurrentPos(){
        if(!this.isPaintable()) {
            tiled.alert("Error in script.")
            return
        }
        tiled.log(`Painting ${this.tilePosition.x},${this.tilePosition.y}`)

        // this.map.currentLayer
    }

    static getLayer(){
        //
        // return this.map.currentLayer
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