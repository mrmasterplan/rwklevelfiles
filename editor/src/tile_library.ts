import fs from "fs";
import http from "http";
import config from "./config";
import {glob} from "glob";
import path from "path";
import {createCanvas, loadImage} from "canvas";

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
            const final_name = config.tile_library.library_dir+'/'+path.basename(tile_path)
            // console.log(`copy ${tile_path} to ${final_name}`)
            fs.copyFileSync(tile_path,final_name)
            const index = Buffer.from(path.basename(tile_path,'.png'),'hex').readUInt32LE()
            createBaseDerivedMapTile(index,final_name)
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
                });
                file.on('close',()=>{
                    createBaseDerivedMapTile(tile.index,tile_file)
                    treatSpecialTiles(tile.index,tile_file)
                })
            }else{
                createBaseDerivedMapTile(tile.index,tile_file)
                treatSpecialTiles(tile.index,tile_file)
            }
        }

    }

}

async function treatSpecialTiles(index:number,tile_file:string) {
    // // spring special addition. Considered, but rejected.
    // switch (index){
    //     case 61: { // string
    //         // the special case here is that we need another image for a tile shaft.
    //         // the index 61 without modifiers gives a spring shaft
    //         // to make a spring top, we need to add a special bit: 0x00000200 (LE!)
    //         const extra_index = index + 0x20000
    //
    //         // first we need to copy the image to the top index image.
    //         fs.copyFileSync(tile_file,path.dirname(tile_file)+'/3d000300.png')
    //
    //         // then we need to creat the image of the shaft image.
    //         const base_tile = await loadImage(tile_file);
    //
    //         const half_cv = createCanvas(base_tile.width, base_tile.height/2)
    //         const half_ctx = half_cv.getContext('2d')
    //         half_ctx.drawImage(base_tile, 0, -base_tile.height/2)
    //         const final_cv = createCanvas(base_tile.width, base_tile.height)
    //         const final_ctx = final_cv.getContext('2d')
    //         final_ctx.drawImage(half_cv, 0, 0)
    //         final_ctx.drawImage(half_cv, 0, base_tile.height/2)
    //         fs.writeFileSync( path.dirname(tile_file)+'/3d000100.png',final_cv.toBuffer('image/png'))
    //
    //         break;
    //     }
    //
    // }
}


async function createBaseDerivedMapTile(index:number,tile_file:string){
    const final_name = tile_file.slice(0,-10)+".map.png"
    if(fs.existsSync(final_name)) return
    console.log(`Now creating map tile for index ${index}`)

    const base_tile = await loadImage(tile_file);

    const h_scale = (config.tile_library.map_tile.reduced_w/config.tile_library.tile_width)
    const v_scale = (config.tile_library.map_tile.reduced_h/config.tile_library.tile_height)

    const bkg = await loadImage(config.tile_library.map_base_tile);
    const final_cv = createCanvas(bkg.width, bkg.height)
    const final_ctx = final_cv.getContext('2d')
    final_ctx.drawImage(bkg, 0, 0)
    final_ctx.translate(-(config.tile_library.map_tile.reduced_w-config.tile_library.tile_width)/2,-(config.tile_library.map_tile.reduced_h-config.tile_library.tile_height)/2)
    final_ctx.scale(h_scale,v_scale)
    final_ctx.drawImage(base_tile, 0, 0)
    fs.writeFileSync( final_name,final_cv.toBuffer('image/png'))

}