
// This class has the function to convert a map generated in Tiled based on the tilesets
// into a .kitty file that can be injected into the browser game.
// the conversion is one way only. The reason for that is that paint has many different code-points
// in the game and we don't kow how to relate all the code-points back to one tile definition.


import {glob} from "glob";
import config from "./config";
import * as fs from "fs";
import path from "path";
import {CellGrid, Level_analysis} from "./level_analysis";

import {Level} from './level'

const base_level = Buffer.from("1000000000000000050000001c000000ffffffff05000000303030310000000000000000000000000000000000000000f60200000f0000000a00000000000000010000000100000001000000010000000100000001000000010000000100000001000000010000000100000001000000010000000100000000000000010000000200000002000000020000000200000002000000020000000200000002000000020000000200000002000000020000000100000001000000010000000200000002000000010000000100000001000000010000000100000001000000010000000100000001000000020000000100000001000000020000000200000002000000010000000100000001000000010000000100000001000000010000000100000001000000020000000100000001000000020000000200000002000000020000000100000001000000010000000000000001000000010000000100000001000000020000000100000001000000010000000100000001000000020000000200000001000000010000000000000001000000010000000100000001000000020000000100000000000000000000000000000001000000010000000200000001000000010000000100000001000000010000000100000001000000020000000100000000000000000000000000000000000000010000000200000001000000010000000100000001000000010000000100000001000000020000000100000000000000000000000000000001000000010000000200000002000000020000000200000002000000020000000200000002000000020000000100000000000000000000000000000000000000010000000100000001000000010000000100000001000000010000000100000001000000010000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000040000000000000000000000080000000000aa4300005a43000000000800000000000c430080934300000000530000000100000000010000000000000000000000000000000000000000000000006666663f0000000000000000b800bc0000000000000000000000000000000000003f0000003f0100000000010000000001000000000000000000000000","hex")

export async function convertAllLevels(){
    for(let filename of glob.sync(config.editor.level_conversion)){

        const conv = new LevelConverter(filename,JSON.parse(fs.readFileSync(filename,'utf-8')))
        conv.writeToTarget(`${config.db.levels_in}/${conv.name}.kitty`)
    }
    // dummyTestLevel()
}


interface TileChunk {
    data:number[],
    height: number,
    width: number,
    x:number,
    y:number
}

interface TileLayer {
    chunks:TileChunk[],
    height:number,
    id:number,
    name:string,
    startx:number,
    starty:number,
    type:"tilelayer",
    width:number,
    x:number,
    y:number,
}
interface ObjectLayerObject {
    id:number,
    text?:
        {
            text:string,
        },
    gid?:number,
    x:number,
    y:number
}
interface ObjectGroupLayer {
    id:number,
    name:string,
    objects:ObjectLayerObject[],
    type:"objectgroup",
    x:number,
    y:number
}


interface MapTileseReference {
    firstgid:number,
    source:string,
}
interface MapFile {
    type:string,
    tilesets:MapTileseReference[],
    tileheight:number, // this will be used when we calculate which tile a callout belongs to
    tilewidth:number,
    layers: (TileLayer|ObjectGroupLayer)[]
}

interface GridCell {
    base:number,
    paint:number
}

interface Callout {
    pos:{x:number,y:number},
    text:string
}

class CalloutListWriter{
    callouts:Callout[]
    constructor() {
        this.callouts=[]
    }
    add(pos:{x:number,y:number},text:string){
        this.callouts.push({pos,text});
    }
    getBuffer(){
        let tot_size=0
        const callbuffers:Buffer[]=[]
        for(let call of this.callouts){
            const size = 13 + call.text.length
            const buf = Buffer.alloc(size,0)

            buf.writeUInt32LE(call.pos.x)
            buf.writeUInt32LE(call.pos.y,4)
            buf.writeUInt32LE(call.text.length+1,8)
            Buffer.from(call.text,'utf-8').copy(buf,12)

            callbuffers.push(buf)
            tot_size+=size

        }
        const size_of_callout_field = tot_size+4
        const buf = Buffer.alloc(size_of_callout_field+4+4)

        buf.writeUInt32LE(1) //magic number unknown reason
        buf.writeUInt32LE(size_of_callout_field,4)
        buf.writeUInt32LE(callbuffers.length,8)
        Buffer.concat(callbuffers).copy(buf,12)
        return buf
    }
}

export class LevelConverter {
    isbad:boolean
    name:string
    tile_gid:{[gid:number]:number}
    // grid?:CellGrid
    offset?:{x:number,y:number}
    gridCells?:GridCell[][]
    // calls:CalloutListWriter
    lvl:Level
    robot_gid?:number
    kitty_gid?:number
    tile_w:number
    tile_h:number

    constructor(public filename:string, public lvljson:MapFile) {
        console.log(`Now converting ${filename}`)
        this.tile_w=40
        this.tile_h=40
        this.name = path.basename(filename,'.json')
        this.isbad=false
        this.tile_gid={}
        this.lvl = new Level({name:this.name})
        // this.calls = new CalloutListWriter()
        if(lvljson.type!=='map'){
            this.isbad=true
            return
        }
        this._parseTilesets(lvljson.tilesets)

        this._setCellArrayLimits()
        console.log(`cols:${this.lvl.grid.size_x}, rows:${this.lvl.grid.size_y}`)

        this._parseLevelIntoGridCells()
        this._transferGridCellsIntoGrid()

        this._processObjectLayers()

    }
    _processKittyAndRobotPosition(gid:number,x:number,y:number){
        if(gid==this.robot_gid){
            this.lvl.robot.x=x
            this.lvl.robot.y=y
        }
        if(gid==this.kitty_gid){
            this.lvl.kitty.x=x
            this.lvl.kitty.y=y-5
        }
    }

    _processObjectLayers(){

        const processCallout=(obj:ObjectLayerObject)=>{
            if(!obj.text) return
            const text = obj.text.text
            const x = Math.round(obj.x/this.lvljson.tilewidth) + this.offset!.x
            const y = Math.round(obj.y/this.lvljson.tileheight)+ this.offset!.y

            // check that there really is a callout:
            const cell = this.gridCells![y][x]
            // console.log(cell)
            if(cell.base!=70){
                console.log(`Text id ${obj.id} "${text}" in cell (${Math.round(obj.x/this.lvljson.tilewidth)},${Math.round(obj.y/this.lvljson.tileheight)}) is not as a Radio Beacon and will be ignored.`)
            }else{
                this.lvl.callouts.addCallout(x,y,text)
            }
        }

        const processTile=(obj:ObjectLayerObject)=>{
            if(!obj.gid || ![this.robot_gid,this.kitty_gid].includes(obj.gid)) return
            const x = obj.x + this.offset!.x*this.lvljson.tilewidth
            const y = obj.y+ this.offset!.y*this.lvljson.tileheight
            this._processKittyAndRobotPosition(obj.gid,x+this.lvljson.tilewidth/2,y-this.lvljson.tileheight/2)
        }

        for(let layer of this.lvljson.layers) {
            if (layer.type !== 'objectgroup') {
                continue; // only object layers can contain callouts
            }
            for(let obj of layer.objects){
                if (obj.text){
                    processCallout(obj)
                    continue
                }
                if(obj.gid){
                    processTile(obj)
                    continue
                }

            }
        }
    }

    _transferGridCellsIntoGrid(){
        for(let j=0;j<this.lvl.grid.size_y;j++){
            for(let i=0;i<this.lvl.grid.size_x;i++){
                const cell = this.gridCells![j][i]
                this.lvl.grid.setCell(i,j,cell.base+cell.paint)
            }
        }
    }

    _parseLevelIntoGridCells(){
        for(let layer of this.lvljson.layers){
            if(layer.type!=='tilelayer'){
                continue; // object layers do not contribute to level size
            }

            for(let chunk of layer.chunks){
                for(let j = 0; j<chunk.height; j++)
                    for(let i = 0; i<chunk.width; i++){
                        const gid = chunk.data[i+j*chunk.width]
                        if(gid){// if data is not null
                            const x = i+chunk.x + this.offset!.x
                            const y = j+chunk.y +  this.offset!.y

                            if(gid == this.robot_gid || gid == this.kitty_gid){
                                this._processKittyAndRobotPosition(gid,(x+0.5)*this.tile_w,(y+0.5)*this.tile_h)
                            }

                            const val = this.tile_gid[gid]
                            if(!val) continue  // this will be the case for robot and kitty tiles
                            const cell = this.gridCells![y][x] || {base:0,paint:0}
                            //determine the kind of cell base vs paint vs combined.
                            const base_val = val & 0x7f
                            const paint_val = val & 0xffffff80
                            if(base_val){
                                // it's a base value
                                if(cell.base != 0 ){
                                    console.warn(`WARNING: The level cell at pos x,y=${i+chunk.x},${j+chunk.y} has more than one base value assignment. Ignoring the second one.`)
                                }else{
                                    cell.base = base_val
                                }
                            }
                            if(paint_val){
                                // it's a paint value
                                if(cell.paint != 0 ){
                                    console.warn(`WARNING: The level cell at pos x,y=${i+chunk.x},${j+chunk.y} has more than one paint value assignment. Ignoring the second one.`)
                                }else{
                                    cell.paint = paint_val
                                }
                            }
                        }
                    }

            }
        }
    }

    _setCellArrayLimits(){
        const {min_x,min_y,max_x,max_y} = this._getCellArrayExtent()

        let cols = max_x-min_x+1;
        let rows = max_y-min_y+1;

        // if(cols<10)cols=10
        // if(rows<7)rows=7

        this.offset={
            x:-min_x,
            y:-min_y
        }

        // set the cell array that we end up exporting
        this.lvl.changeGridSize(cols,rows)

        // set the cell array for intermediate analysis
        this.gridCells = []
        for(let j=0;j<this.lvl.grid.size_y;j++){
            this.gridCells[j]=[]
            for(let i=0;i<this.lvl.grid.size_x;i++){
                this.gridCells[j][i]={base:0,paint:0}
            }

        }
    }

    _getCellArrayExtent(){
        // traverse all cells of all chunks and determine what the min and may position of any 0 is in both x and  y
        let min_x:number|undefined = undefined
        let min_y:number|undefined = undefined
        let max_x:number|undefined = undefined
        let max_y:number|undefined = undefined

        for(let layer of this.lvljson.layers){
            if(layer.type!=='tilelayer'){
                continue; // object layers do not contribute to level size
            }
            //console.log(`getting extent from layer ${layer.name}`)

            // TODO: This entire section can be accelerated if we look at the entire chunk and see that no cell in it
            // has a chance to contribute.
            // we would let the min cell from the upper left chunk
            // and the max cell from the lowe right chunk
            for(let chunk of layer.chunks){
                for(let j = 0; j<chunk.height; j++)
                    for(let i = 0; i<chunk.width; i++){
                        const chunk_gid = chunk.data[i+j*chunk.width]
                        if(chunk_gid && chunk_gid!=this.robot_gid && chunk_gid!=this.kitty_gid){// if data is not null
                            const x = i+chunk.x
                            const y = j+chunk.y
                            if(typeof min_x == 'undefined' || x<min_x) min_x=x;
                            if(typeof max_x == 'undefined' || x>max_x) max_x=x;
                            if(typeof min_y == 'undefined' || y<min_y) min_y=y;
                            if(typeof max_y == 'undefined' || y>max_y) max_y=y;
                           // console.log(`${x},${y}: y max, min ${max_y}, ${min_y}`)
                        }
                    }

            }
        }
        if(typeof min_x == 'undefined' || typeof min_y == 'undefined' ||typeof max_x == 'undefined' ||typeof max_y == 'undefined'){
            console.error("Unable to find any set cell in the level. Aborting")
            process.exit(-1)
        }

        return {min_x,min_y,max_x,max_y}
    }

    _parseTilesets(tlsts:MapTileseReference[]){
        // parse the tileset references and insert into the gid to byte database
        for(let tlst of tlsts){
            let tiledata:any
            if(tlst.source){
                const path_to_tileset = path.join(path.dirname(this.filename),tlst.source)
                tiledata = JSON.parse(fs.readFileSync(path_to_tileset,'utf-8'))
            }else{
                tiledata = tlst
            }
            // go through the tiles in the set
            for(let tile of tiledata.tiles){
                // this is how tile ids are handled in Tiled. ID in set + firstgid of tileset
                const gid = tile.id + tlst.firstgid
                // look for the bytes property
                for(let prop of tile.properties){
                    if(prop.name == 'bytes'){
                        this.tile_gid[gid]=prop.value
                        break;
                    }
                    if(prop.name == 'kind'){
                        if(prop.value == 'robot'){
                            if(this.robot_gid) console.warn("You have loaded more than one tileset with the robot tile. Only one of them will work.")
                            this.robot_gid = gid
                            break
                        }
                        if(prop.value == 'kitty'){
                            if(this.kitty_gid) console.warn("You have loaded more than one tileset with the kitty tile. Only one of them will work.")
                            this.kitty_gid = gid
                            break
                        }
                    }
                }
            }
        }
    }


    writeToTarget(filename:string){
        // let base:Buffer;
        // if(fs.existsSync(filename)){
        //     base = fs.readFileSync(filename)
        // }else{
        //     base = Buffer.from(base_level)
        // }
        // const lvlana = new Level_analysis()
        // const buf = lvlana.setName(base,this.name)
        //
        // const outbuf_w_grid= lvlana.setGrid(buf,this.grid!)
        // const outbuf_final = lvlana.setCallouts(outbuf_w_grid,this.calls.getBuffer())
        fs.writeFileSync(filename,this.lvl.serialize())
    }
}