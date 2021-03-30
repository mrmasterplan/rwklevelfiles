import fs from "fs";
import config from "./config";
import path from "path";
import {Canvas, createCanvas, Image} from "canvas";
import {Tile_library} from "./tile_library";
import {DB_file_hex} from "./rwkpage";
import inquirer from "inquirer";

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
            await this.analyze(buf);

        }
    }

    async analyze(buf:Buffer) {
        console.log("Level analysis started.")
        // get the name:
        const end_of_name = buf.indexOf(Buffer.alloc(1, 0), level_structure.header.name_start);
        console.log(`name ends at byte ${end_of_name}`)
        const name = buf.slice(level_structure.header.name_start, end_of_name).toString('utf-8')
        console.log(`Level name: "${name}"`)
        const filename = name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        await fs.writeFileSync(`${config.levels.bin_dir}/${filename}.kitty`, buf);


        const lenth_of_name = end_of_name - level_structure.header.name_start;

        console.log(`Saved raw to ${config.levels.bin_dir}/${filename}.kitty`)
        const filesize = buf.length
        console.log(`Size of file is ${filesize}`)
        const num_columns = buf.readUInt32LE(lenth_of_name + level_structure.header.col_num_start)
        const num_rows = buf.readUInt32LE(lenth_of_name + level_structure.header.row_num_start)
        console.log(`columns: ${num_columns}`)
        console.log(`rows: ${num_rows}`)

        const array_bytes = num_rows * num_columns * 4;
        const array_start = level_structure.block_data.array_offset + lenth_of_name;
        const array_buffer = buf.slice(array_start, array_start + array_bytes);
        console.log(`block array size: ${array_bytes} bytes`)
        console.log(`level size without name or array is ${filesize - lenth_of_name - array_bytes}`)

        // create the map of the level
        let canvas: Canvas;
        try {
            canvas = createCanvas(num_columns * config.tile_library.tile_width, num_rows * config.tile_library.tile_height)
        } catch (e) {
            console.log(`unable to create canvas of size ${num_columns * config.tile_library.tile_width}, ${num_rows * config.tile_library.tile_height}`)
            return
        }

        // cell block bytes
        const cell_array_file = fs.createWriteStream(`${config.levels.bin_dir}/${filename}.cells.txt`)
        await cell_array_file.write("# Cell array in the same arrangement as in the level.\n")
        await cell_array_file.write("# the first number is decimal,\n")
        await cell_array_file.write("# the second number below is the hex representation BE in file order\n")
        await cell_array_file.write("# The third number is hex LE which is more human readable\n\n")

        // lets get some leaderboards ready to make a reference for fuzzing.
        const cell_values:{[key:number]:true}={}

        const ccont = canvas.getContext('2d')
        for (let j = 0; j < num_rows; j++) {
            for (let i = 0; i < num_columns; i++) {
                const byte_offset = array_start + (j * num_columns + i) * 4; //4 bytes per cell
                // const cell_byte = buf.readUInt8(byte_offset) & 0x7f
                //console.log(`cell index ${cell_byte}`)
                // const img = this.tiles.tile_of(cell_byte);
                const full_cell_data = buf.readUInt32LE(byte_offset)

                // add to leaderboard
                cell_values[full_cell_data]=true;

                const cell_type = full_cell_data
                // const cell_type = cell_byte; //full_cell_data % 100
                const path = this.tiles.tile_of(cell_type)

                if (!path) {
                    //console.log(`no tile data for cell(${i},${j}), type ${cell_type} byte offset is ${byte_offset}, buffer is ${buf.slice(byte_offset, byte_offset + 4)}`)
                }else {
                    const img = new Image()
                    img.onload = () => ccont.drawImage(img, i * config.tile_library.tile_width, j * config.tile_library.tile_height)
                    img.onerror = err => {
                        throw err
                    }
                    img.src = this.tiles.tile_of(cell_type)
                }
                // ccont.drawImage(img,i*config.tile_library.tile_width,j*config.tile_library.tile_height)

            }

            // write cell data as text array of integers
            for (let i = 0; i < num_columns; i++) {
                const byte_offset = array_start + (j * num_columns + i) * 4; //4 bytes per cell
                const full_cell_data = buf.readUInt32LE(byte_offset)

                await cell_array_file.write(full_cell_data.toString().padStart(9, '0') + "    ")
            }
            await cell_array_file.write("\n");

            // write cell data as text array of integers
            for (let i = 0; i < num_columns; i++) {
                const byte_offset = array_start + (j * num_columns + i) * 4; //4 bytes per cell

                await cell_array_file.write(buf.slice(byte_offset,byte_offset+4).toString('hex').padStart(9, ' ') + "    ")
            }
            await cell_array_file.write("\n");

            // write cell data as text array of integers
            for (let i = 0; i < num_columns; i++) {
                const byte_offset = array_start + (j * num_columns + i) * 4; //4 bytes per cell
                const full_cell_data = buf.readUInt32LE(byte_offset)
                const BEbuf = Buffer.alloc(4)
                BEbuf.writeUInt32BE(full_cell_data)
                await cell_array_file.write(BEbuf.toString('hex').padStart(9, ' ') + "    ")
            }
            await cell_array_file.write("\n\n\n");
        }
        // canvas.getContext('2d').getImageData()
        // ccont.putImageData({data:Uint8ClampedArray},0,0)
        fs.writeFileSync( `${config.levels.bin_dir}/${filename}.map.png`,canvas.toBuffer('image/png'))

        const all_values = Object.keys(cell_values).map(k=>+k);
        fs.writeFileSync( `${config.levels.bin_dir}/${filename}.fuzz.json`,JSON.stringify(all_values))
        // const sort_values = all_values.sort((a,b)=>a<b?-1:a==b?0:1);
        // console.log("Highest and lowest seen cell values:")
        // console.log(sort_values.slice(0,80))
        // console.log(sort_values.slice(-20))
    }
}