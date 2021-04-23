import config from "./config";
import {glob} from "glob";
import fs from "fs";
import {Level} from "./level";

class Tile {
    constructor(public path:string ,public val:number, public paint_grid?:string) {

    }

}

interface StringProperty {
    "name":string,
    "type":"string",
    "value":string
}
interface NumberProperty {
    "name":string,
    "type":"float"|"int",
    "value":number
}
interface BoolProperty {
    "name":string,
    "type":"bool",
    "value":boolean
}

type CustomProperty = NumberProperty|StringProperty|BoolProperty

interface JsonTile {
    "id":number,
    "image":string,
    "imageheight":40,
    "imagewidth":40,
    "properties"?:CustomProperty[]
}

interface JsonTileset {
    columns: number,
    grid: {
        height: number,
        orientation: string,
        width: number
    },
    margin: number,
    name: string,
    spacing: number,
    tilecount: number,
    tiledversion: string,
    tileheight: number,
    tiles:JsonTile[]
    properties?:CustomProperty[],

    tilewidth: number,
    type: "tileset",
    version: number
}

export class Tileset {
    tiles:Tile[]

    constructor(public name:string, public is_paintable=false, public map_tileset=false) {
        this.tiles=[]
    }

    addTile(val:number,path:string,paint_grid?:string){
        this.tiles.push(new Tile(path,val,paint_grid))
    }

    getTiles(){
        return this.tiles.map((tile,i)=>{
            const json:JsonTile = {    "id":i,
                "image":tile.path,
                "imageheight":40,
                "imagewidth":40,
                "properties":[
                    {
                        name: "bytes",
                        type: "int",
                        value: tile.val
                    }
                ]}
            if(tile.paint_grid){
                json.properties?.push({
                    name:"paint_grid",
                    type:"string",
                    value:tile.paint_grid
                })
            }
            if(this.map_tileset){
                // erase the other properties. this prevents collision
                json.properties=[{
                    name:"map",
                    type:"int",
                    value:tile.val
                }]
            }

            return json
        })
    }

    getValues(){
        return this.tiles.map(t=>t.val)
    }

    getTileset(){
        const tilevals = this.getValues()
        const proto_tileset:JsonTileset =  {
            columns: 0,
            grid: {
                height: 1,
                orientation: "orthogonal",
                width: 1
            },
            margin: 0,
            name: this.name,
            spacing: 0,
            tilecount: tilevals.length,
            tiledversion: "1.5.0",
            tileheight: 40,
            tiles: this.getTiles(),

            tilewidth: 40,
            type: "tileset",
            version: 1.5
        }
        if(this.is_paintable){
            proto_tileset.properties = proto_tileset.properties||[]
            proto_tileset.properties.push({
                name:"is_paintable",
                type:"bool",
                value: !!this.is_paintable
            })
        }

        return proto_tileset
    }

}
// export const base_tileset = new Tileset('base')
// for(let val of config.editor.base_tile_values){
//     base_tileset.addTile(val,`../${config.editor.tiles}/${val.toString(16).padStart(2,'0')}000000.png`)
// }

export async function CreateTilesets(){
    for(let reflvl of glob.sync(config.dev.base_levels+"/*")){
        const is_base_tileset = reflvl.endsWith("base.kitty")

        const fullbuf = fs.readFileSync(reflvl)
        const lvl = Level.from(fullbuf);
        console.log(`opened level ${lvl.name}, ${lvl.grid.size_x} ${lvl.grid.size_y}`)

        let base_row=0;
        let block_found = false;
        while(!block_found) {
            for (let i = 0; i < lvl.grid.size_x; i ++) {
                if(lvl.grid.getCell(i,base_row)){
                    block_found=true;
                    break;
                }
            }
            if(!block_found){
                base_row++
            }
        }


        const magic_skip = 4;
        const magic_row = 1 + base_row; // after empty rows are skipped

        const tileset = new Tileset(lvl.name,!is_base_tileset)
        let map_tileset:Tileset|undefined;
        if(is_base_tileset) map_tileset = new Tileset('map',false,true)

        for(let i = 0; i<lvl.grid.size_x; i+=magic_skip){
            // const tileval = lvl.grid.getCellAsNumber(j,magic_row)
            let val = lvl.grid.getCell(i,magic_row)
            // const buf = lvl.grid.getCellAsBuff(i,magic_row)

            // extra special hack for the base tile set coming up:
            if(!is_base_tileset)
                val = val & 0xffffff80
            if(val<0) val+=4294967296
            //in the base tileset we actually want to have the full tile type.
            // for all other tilesets, we only want the paint part and unpainted cells might as well be 0

            if(!val) continue // there may be base tiles in the row in painted levels.

            const buf = Buffer.alloc(4,0)
            buf.writeUInt32LE(val)

            if(is_base_tileset){
                tileset.addTile(val,`../${config.editor.tiles}/${buf.toString('hex')}.png`)
                if(map_tileset)
                    map_tileset.addTile(val,`../${config.editor.tiles}/${buf.toString('hex').slice(0,2)}.map.png`)
            }else{
                // for all paintable cells, we now need to find the surrounding paint pattern
                const x=i
                const y=magic_row
                // grap the used/unused state of the surrounding cells.
                const cases:boolean[]=[]
                cases.push(!!lvl.grid.getCell(x-1,y-1))
                cases.push(!!lvl.grid.getCell(x,y-1))
                cases.push(!!lvl.grid.getCell(x+1,y-1))
                cases.push(!!lvl.grid.getCell(x-1,y))
                // cases.push(lvl.grid.getCell(x,y-1)) // the cell itself
                cases.push(!!lvl.grid.getCell(x+1,y))
                cases.push(!!lvl.grid.getCell(x-1,y+1))
                cases.push(!!lvl.grid.getCell(x,y+1))
                cases.push(!!lvl.grid.getCell(x+1,y+1))
                cases.map(x=>x?"1":"0").join("")

                tileset.addTile(val,`../${config.editor.tiles}/${buf.toString('hex')}.png`,cases.map(x=>x?"1":"0").join(""))

            }


        }

        if(map_tileset){
            fs.writeFileSync(`${config.editor.resources}/${config.editor.tilesets}/${map_tileset.name}.json`,JSON.stringify(map_tileset.getTileset(),null,2))
        }
        fs.writeFileSync(`${config.editor.resources}/${config.editor.tilesets}/${lvl.name}.json`,JSON.stringify(tileset.getTileset(),null,2))
        fs.writeFileSync(`${config.editor.resources}/${config.editor.fuzz}/${lvl.name}.fuzz.json`,JSON.stringify(tileset.getValues(),null,2))
    }
}