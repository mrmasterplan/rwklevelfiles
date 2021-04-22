import fs from "fs";
import http from "http";
import config from "./config";
import {glob} from "glob";
import path from "path";

export class Tile_library {

    lib:{[tile_id:number]:string};

    constructor() {
        this.lib={};
        // this.download_tile_library()
    }

    async ready(){
        // await this.download_tile_library()
    }


    async download_tile_library(){
        // this is downloaded unless already present.
        // I don't want to include the tiles in the git repo so as not to break copyright.
        if (!fs.existsSync(config.tile_library.library_dir)){
            fs.mkdirSync(config.tile_library.library_dir);
        }

        // copy special tiles
        config.tile_library.special_tiles.forEach(tile_path=>{
            fs.copyFile(tile_path,config.tile_library.library_dir+'/'+path.basename(tile_path),()=>{})
        })

        // const tutorial_page:string = await new Promise((res,rej)=>http.request(config.tile_library.url.http_opts, (resp)=>{
        //     let str:string = '';
        //
        //     //another chunk of data has been received, so append it to `str`
        //     resp.on('data',  (chunk)=>{
        //         str += chunk;
        //     });
        //
        //     //the whole response has been received, so we just print it out here
        //     resp.on('end',  ()=>{
        //         res(str);
        //     });
        // }).end());
        //
        // const expr = new RegExp( config.tile_library.url.image_link_regex,'ig');
        // let result;
        for(let tile of config.tile_library.tiles_to_download){
        // while((result = expr.exec(tutorial_page)) !== null) {
        //     // console.log(`Found ${result.groups!.path} index ${+(result.groups!.index)}`)
        //     const index= +(result.groups!.index);
        //     const tile_path = result.groups!.path
        //     const tile_file = `${config.tile_library.library_dir}/${(index-1).toString(16).padStart(2,'0')}000000.png`
            const tile_file = `${config.tile_library.library_dir}/${(tile.index).toString(16).padStart(2,'0')}000000.png`
        //     const opts = config.tile_library.url.http_opts
            this.lib[tile.index] = tile_file; // a bit agressive, since we haven't downloaded yet, but I feel lazy
            if(!fs.existsSync(tile_file)) {

                const file = fs.createWriteStream(tile_file);
                console.log(`Downloading for tile ${tile.index} from ${tile.url}`)
                http.get(tile.url, (response)=> {
                    response.pipe(file);
                    response.on('close',()=>{createBaseDerivedMapTile(tile.index,tile_file)})
                });
            }
        }

    }

}

function createBaseDerivedMapTile(index:number,tile_file:string){


}