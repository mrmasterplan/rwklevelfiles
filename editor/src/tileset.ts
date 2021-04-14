import config from "./config";


export class Tileset {
    tiles:{[key:number]:string}
    name:string

    constructor(name:string) {
        this.name=name
        this.tiles={}
    }

    addTile(val:number,path:string){
        this.tiles[val]=path
    }

    getValues(){
        return Object.keys(this.tiles).map(i=>+i)
    }

    getTileset(){
        const tilevals = this.getValues()
        return {
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
            tiles: tilevals.map((val,index)=>{
                return {
                    id:index,
                    image: this.tiles[val],
                    imageheight:40,
                    imagewidth:40,
                    properties:[{
                        name: "bytes",
                        type: "int",
                        value: val
                    }]
                }
            }),

            tilewidth: 40,
            type: "tileset",
            version: 1.5
        }
    }

}
// export const base_tileset = new Tileset('base')
// for(let val of config.editor.base_tile_values){
//     base_tileset.addTile(val,`../${config.editor.tiles}/${val.toString(16).padStart(2,'0')}000000.png`)
// }