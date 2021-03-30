import fs from "fs";
import http from "http";
import config from "./config";
// import {Image} from "canvas";

export class Tile_library {

    lib:{[tile_id:number]:string};

    constructor() {
        this.lib={};
    }

    async ready(){
        await this.download_tile_library()
    }

    url_of_index(i:number){
       return config.tile_library.url.base+config.tile_library.url.name_base+`000${i}`.slice(-config.tile_library.url.decimals)+config.tile_library.url.extension;
    }
    path_of_tile(i:number){
        return `${config.tile_library.library_dir}/${config.tile_library.url.name_base}`+`000${i}`.slice(-config.tile_library.url.decimals)+config.tile_library.url.extension;
    }

    tile_of(i:number){
        let path = this.lib[i]
        if(!path) {
            const buf = Buffer.alloc(4)
            buf.writeUInt32LE(i)
            const tile_file = `${config.fuzzer.dir}/${config.fuzzer.tiles}/${buf.toString('hex')}.png`
            if(fs.existsSync(tile_file)){
                path = tile_file;
                this.lib[i]=tile_file
            }else{
                console.log(`Unknown tile encoding ${buf.toString('hex')}`)
            }
        }


        return path;
    }

    async download_tile_library(){
        // this is downloaded unless already present.
        // I don't want to include the tiles in the git repo so as not to break copyright.
        if (!fs.existsSync(config.tile_library.library_dir)){
            fs.mkdirSync(config.tile_library.library_dir);
        }

        for(let index = config.tile_library.lowest_index; index<=config.tile_library.highest_index; index++){
            // don't hit the blacklisted ones.
            if(config.tile_library.blacklisted_indices.indexOf(index)>=0) continue;

            const local = this.path_of_tile(index);
            //console.log(`Looking for tile ${index} at ${local}`)
            if(!fs.existsSync(local)){
                await new Promise((resolve,reject) => {
                    const file = fs.createWriteStream(local);
                    console.log(`Downloading for tile ${index} from ${this.url_of_index(index)}`)
                    http.get(this.url_of_index(index), function(response) {
                        response.pipe(file);
                        // file.close();
                        resolve(true);
                    });
                });
            }

            // now the file exists and we can load it into the memory library
            // const img = new Image();
            // img.onerror = err => {
            //     console.error(err)
            //     throw err
            // }
            // img.src=local;

            this.lib[index-1] = local;

        }
    }
}