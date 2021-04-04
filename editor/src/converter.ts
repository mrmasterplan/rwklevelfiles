
// This class has the function to convert a map generated in Tiled based on the tilesets
// into a .kitty file that can be injected into the browser game.
// the conversion is one way only. The reason for that is that paint has many different code-points
// in the game and we don't kow how to relate all the code-points back to one tile definition.


import {glob} from "glob";
import config from "./config";
import * as fs from "fs";
import path from "path";
import {CellGrid, Level_analysis} from "./level_analysis";

const base_level = Buffer.from("1000000000000000050000001c000000ffffffff05000000303030310000000000000000000000000000000000000000f60200000f0000000a00000000000000010000000100000001000000010000000100000001000000010000000100000001000000010000000100000001000000010000000100000000000000010000000200000002000000020000000200000002000000020000000200000002000000020000000200000002000000020000000100000001000000010000000200000002000000010000000100000001000000010000000100000001000000010000000100000001000000020000000100000001000000020000000200000002000000010000000100000001000000010000000100000001000000010000000100000001000000020000000100000001000000020000000200000002000000020000000100000001000000010000000000000001000000010000000100000001000000020000000100000001000000010000000100000001000000020000000200000001000000010000000000000001000000010000000100000001000000020000000100000000000000000000000000000001000000010000000200000001000000010000000100000001000000010000000100000001000000020000000100000000000000000000000000000000000000010000000200000001000000010000000100000001000000010000000100000001000000020000000100000000000000000000000000000001000000010000000200000002000000020000000200000002000000020000000200000002000000020000000100000000000000000000000000000000000000010000000100000001000000010000000100000001000000010000000100000001000000010000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000040000000000000000000000080000000000aa4300005a43000000000800000000000c430080934300000000530000000100000000010000000000000000000000000000000000000000000000006666663f0000000000000000b800bc0000000000000000000000000000000000003f0000003f0100000000010000000001000000000000000000000000","hex")

export async function convertAllLevels(){
    for(let filename of glob.sync(config.editor.level_conversion)){

        const conv = new LevelConverter(filename,JSON.parse(fs.readFileSync(filename,'utf-8')))
        conv.writeToTarget(`${config.db.levels_in}/${conv.name}.kitty`)
    }
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
    text:
        {
            text:string,
        },
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

export class LevelConverter {
    isbad:boolean
    name:string
    tile_gid:{[gid:number]:number}
    grid?:CellGrid
    offset?:{x:number,y:number}
    gridCells?:GridCell[][]

    constructor(public filename:string, public lvljson:MapFile) {
        console.log(`Now converting ${filename}`)
        this.name = path.basename(filename,'.json')
        this.isbad=false
        this.tile_gid={}
        if(lvljson.type!=='map'){
            this.isbad=true
            return
        }
        this._parseTilesets(lvljson.tilesets)

        this._setCellArrayLimits()
        console.log(`cols:${this.grid?.cols}, rows:${this.grid?.rows}`)
        this._parseLevelIntoGridCells()
        this._transferGridCellsIntoGrid()


    }

    _transferGridCellsIntoGrid(){
        for(let j=0;j<this.grid!.rows;j++){
            for(let i=0;i<this.grid!.cols;i++){
                const cell = this.gridCells![j][i]
                this.grid?.writeCellNumber(i,j,cell.base+cell.paint)
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
                            const val = this.tile_gid[gid]
                            const x = i+chunk.x + this.offset!.x
                            const y = j+chunk.y +  this.offset!.y
                            const cell = this.gridCells![y][x] || {base:0,paint:0}
                            if(val<config.editor.max_base_value){
                                // it's a base value
                                if(cell.base != 0 ){
                                    console.warn(`WARNING: The level cell at pos x,y=${i+chunk.x},${j+chunk.y} has more than one base value assignment. Ignoring the second one.`)
                                }else{
                                    cell.base = val
                                }
                            }else{
                                // it's a paint value
                                if(cell.paint != 0 ){
                                    console.warn(`WARNING: The level cell at pos x,y=${i+chunk.x},${j+chunk.y} has more than one paint value assignment. Ignoring the second one.`)
                                }else{
                                    cell.paint = val
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
        const cellBuffer = Buffer.alloc(rows*cols*4,0)
        const grid = new CellGrid(cols,rows,cellBuffer,0)
        this.grid = grid

        // set the cell array for intermediate analysis
        this.gridCells = []
        for(let j=0;j<this.grid.rows;j++){
            this.gridCells[j]=[]
            for(let i=0;i<this.grid.cols;i++){
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
                        if(chunk.data[i+j*chunk.width]){// if data is not null
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
            const path_to_tileset = path.join(path.dirname(this.filename),tlst.source)
            const tiledata = JSON.parse(fs.readFileSync(path_to_tileset,'utf-8'))
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
                }
            }
        }
    }

    // getBuffer(){
    //     const lvlana = new Level_analysis()
    //     const buf = lvlana.setName(base_level,this.name)
    //
    //     return lvlana.setGrid(buf,this.grid!)
    // }
    writeToTarget(filename:string){
        let base:Buffer;
        if(fs.existsSync(filename)){
            base = fs.readFileSync(filename)
        }else{
            base = Buffer.from(base_level)
        }
        const lvlana = new Level_analysis()
        const buf = lvlana.setName(base,this.name)

        const outbuf= lvlana.setGrid(buf,this.grid!)
        fs.writeFileSync(filename,outbuf)
    }
}