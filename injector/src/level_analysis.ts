import fs from "fs";
import config from "./config";
import path from "path";
import {createCanvas, Image} from "canvas";
import {Tile_library} from "./tile_library";
import {DB_file_hex} from "./rwkpage";

const level_structure = {
    header: {
        name_start: 0x18,
        row_num_start: 0x34, // plus file name length
        col_num_start: 0x30,  // plus file name length
    },
    block_data:{
        array_offset: 0x38, // plus file name length
    }
}

// extension to save binary levels
// if(key.endsWith('.kitty')){
//     const hexstring = obj.contents;
//     // @ts-ignore
//     const buf = Buffer.from(hexstring,'hex')
//     this.anlyzer.analyze(buf);
//
// }

export class Level_analysis {
    tiles: Tile_library;
    constructor() {
        if (!fs.existsSync(config.levels.bin_dir)) {
            fs.mkdirSync(config.levels.bin_dir, {recursive: true});
        }
        this.tiles = new Tile_library();
    }
    async ready(){
        await this.tiles.ready();
    }

    async parse_backup(){
        console.log(`Will now analyze all .kitty files in the DB backup`)
        await this._parse_backup(config.db.backup);

    }

    async _parse_backup(dir:string){
        const files = fs.readdirSync(dir,{withFileTypes:true});
        for(let i=0; i<files.length; i++){
            const file = files[i];
            if(file.isDirectory()){
                this._parse_backup(`${dir}/${file.name}`)
                continue
            }
            //is file
            if(!file.name.endsWith('.kitty.json')){
                //console.log("ignoring non kitty files in backup")
                continue
            }
            const data:DB_file_hex = JSON.parse(fs.readFileSync(dir+"/"+file.name, 'utf8'));
            const hexstring = data.contents;
            // @ts-ignore
            const buf = Buffer.from(hexstring,'hex')
            this.analyze(buf);

        }
    }

    async analyze(buf:Buffer){
        console.log("Level analysis started.")
        // get the name:
        const end_of_name = buf.indexOf( Buffer.alloc(1,0),level_structure.header.name_start);
        console.log(`name ends at byte ${end_of_name}`)
        const name = buf.slice(level_structure.header.name_start,end_of_name).toString('utf-8')
        console.log(`Level name: "${name}"`)
        const filename = name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        fs.writeFile(`${config.levels.bin_dir}/${filename}.kitty`, buf, (err) => {
            if (err) throw err;
        });
        const lenth_of_name = end_of_name - level_structure.header.name_start;

        console.log(`Saved raw to ${config.levels.bin_dir}/${filename}.kitty`)
        const filesize = buf.length
        console.log(`Size of file is ${filesize}`)
        const num_columns = buf.readUInt32LE(lenth_of_name+level_structure.header.col_num_start)
        const num_rows = buf.readUInt32LE(lenth_of_name+level_structure.header.row_num_start)
        console.log(`columns: ${num_columns}`)
        console.log(`rows: ${num_rows}`)

        const array_bytes = num_rows*num_columns*4;
        const array_start = level_structure.block_data.array_offset+lenth_of_name;
        const array_buffer = buf.slice(array_start,array_start+array_bytes);
        console.log(`block array size: ${array_bytes} bytes`)
        console.log(`level size without name or array is ${filesize-lenth_of_name-array_bytes}`)

        // create the map of the level
        const canvas = createCanvas(num_columns*config.tile_library.tile_width,num_rows*config.tile_library.tile_height)
        const ccont = canvas.getContext('2d')
        for(let j=0;j<num_rows;j++)
            for(let i=0;i<num_columns;i++){
                const byte_offset = array_start + (j*num_columns+i)*4; //4 bytes per cell
                const cell_byte = buf.readUInt8(byte_offset) & 0x7f
                //console.log(`cell index ${cell_byte}`)
                // const img = this.tiles.tile_of(cell_byte);
                const full_cell_data = buf.readUInt32LE(byte_offset)
                const cell_type = cell_byte; //full_cell_data % 100
                const path = this.tiles.tile_of(cell_type)
                if(!path) {console.log(`no tile data for cell(${i},${j}), type ${cell_type} byte offset is ${byte_offset}, buffer is ${buf.slice(byte_offset,byte_offset+4)}`)}
                const img = new Image()
                img.onload = () => ccont.drawImage(img, i*config.tile_library.tile_width,j*config.tile_library.tile_height)
                img.onerror = err => { throw err }
                img.src = this.tiles.tile_of(cell_type)
                // ccont.drawImage(img,i*config.tile_library.tile_width,j*config.tile_library.tile_height)
        }

        // ccont.putImageData({data:Uint8ClampedArray},0,0)
        fs.writeFileSync( `${config.levels.bin_dir}/${filename}.map.png`,canvas.toBuffer('image/png'))
    }
}