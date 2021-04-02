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

export class PostGrid {
    public bytes_per_cell:number

    constructor(public cols:number, public rows:number,public buf:Buffer, public offset:number) {
        this.bytes_per_cell=1;

    }
    getCellAsNumber(x:number,y:number){
        return this.buf.readUInt8((y * this.cols + x) * this.bytes_per_cell)
    }
    getCellAsBuff(x:number,y:number){
        const offset = (y * this.cols + x) * this.bytes_per_cell
        return this.buf.slice(offset,offset+this.bytes_per_cell)
    }
    isZero(){
        return !Buffer.compare(this.buf,Buffer.alloc(this.buf.length,0))
    }
}

interface Callout {
    cell:{i:number,j:number},
    msg:string
}

export class CalloutList {
    offset_after:number
    callouts:Callout[]
    constructor(level:Buffer, offset:number) {
        this.callouts=[]

        const callout_field_offset = offset
        const should_be_1 = level.readUInt32LE(callout_field_offset);
        if(should_be_1!=1){
            console.log(`ERROR: Should be 1: ${should_be_1}. Expect trouble.`)
        }

        const size_of_callout_field = level.readUInt32LE(callout_field_offset+4);
        // console.log(`size_of_callout_field: ${size_of_callout_field}`)

        // this.offset_after = offset + 4 + 4 + size_of_callout_field

        const n_callouts = level.readUInt32LE(callout_field_offset+8);
        // console.log(`Number callouts: ${n_callouts}`)
        let callout_running_offset = callout_field_offset+4+4+4;
        for(let i=0; i<n_callouts; i++){
            const x_coord = level.readUInt32LE(callout_running_offset);
            callout_running_offset+=4;
            const y_coord = level.readUInt32LE(callout_running_offset);
            callout_running_offset+=4;
            const n_bytes = level.readUInt32LE(callout_running_offset);
            callout_running_offset+=4;
            const callout_text = level.slice(callout_running_offset,callout_running_offset+n_bytes-1).toString('utf-8')
            callout_running_offset+=n_bytes;
            this.callouts.push({cell:{i:x_coord,j:y_coord},msg:callout_text})
            // console.log(`Callout number ${i+1}, (${x_coord},${y_coord}): ${callout_text}`)
        }
        this.offset_after = callout_running_offset
    }
}


export class CellGrid {
    public bytes_per_cell:number
    constructor(public cols:number, public rows:number,public buf:Buffer, public offset:number) {
        this.bytes_per_cell=4;
    }

    getCellAsNumber(x:number,y:number){
        return this.buf.readUInt32LE((y * this.cols + x) * this.bytes_per_cell)
    }

    getCellAsBuff(x:number,y:number){
        const offset = (y * this.cols + x) * this.bytes_per_cell
        return this.buf.slice(offset,offset+this.bytes_per_cell)

    }
    writeCellBuff(x:number,y:number,buf:Buffer){
        const offset = (y * this.cols + x) * this.bytes_per_cell
        buf.copy(this.buf,offset);
    }

    writeCellNumber(x:number,y:number,val:number){
        const offset = (y * this.cols + x) * this.bytes_per_cell
        this.buf.writeUInt32LE(val,offset)

    }
    getCellID(x:number,y:number){
        return (y * this.cols + x);
    }
}



export class LevelDetails {
    name:string
    grid:CellGrid
    pgrid:PostGrid
    callouts:CalloutList
    constructor(public inbuf:Buffer) {
        this.name = this._extractName()
        this.grid = this._extractGrid()
        this.pgrid = this._extractPostGrid()
        this.callouts = new CalloutList(inbuf,this.pgrid.offset+this.pgrid.buf.length)
    }

    _extractName(){
        // get the name:
        const end_of_name = this.inbuf.indexOf(Buffer.alloc(1, 0), level_structure.header.name_start);
        //console.log(`name ends at byte ${end_of_name}`)
        this.name = this.inbuf.slice(level_structure.header.name_start, end_of_name).toString('utf-8')
        //console.log(`Level name: "${name}"`)
        return this.name
    }
    _extractGrid(){

        const num_columns = this.inbuf.readUInt32LE(this.name.length + level_structure.header.col_num_start)
        const num_rows = this.inbuf.readUInt32LE(this.name.length + level_structure.header.row_num_start)

        const offset=level_structure.block_data.array_offset + this.name.length;
        const size_bytes = num_rows*num_columns*4;

        return new CellGrid(num_columns,num_rows,this.inbuf.slice(offset, offset+size_bytes),offset);
    }
    _extractPostGrid(){
        const postgrid_offset = this.grid.offset+this.grid.buf.length
        return new PostGrid(this.grid.cols,this.grid.rows,this.inbuf.slice(postgrid_offset,postgrid_offset+this.grid.cols*this.grid.rows),postgrid_offset)
    }

    next10numbers(){
        let offset = this.callouts.offset_after;

        console.log(`next 10 numbers:`)

        for(let i =0;i<10;i++){
            // console.log(this.inbuf.readUInt32LE(offset))
            console.log(this.inbuf.slice(offset,offset+4).toString('hex'))
            offset+=4;

        }


    }
}

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

    getName(buf:Buffer){
        // get the name:
        const end_of_name = buf.indexOf(Buffer.alloc(1, 0), level_structure.header.name_start);
        //console.log(`name ends at byte ${end_of_name}`)
        const name = buf.slice(level_structure.header.name_start, end_of_name).toString('utf-8')
        //console.log(`Level name: "${name}"`)
        return name
    }
    setName(buf:Buffer,name:string){
        // get the name:
        const buf_before = buf.slice(0,level_structure.header.name_start)
        const old_name = this.getName(buf)
        const buf_after = buf.slice(level_structure.header.name_start+old_name.length)// to the end

        const name_buf = Buffer.from(name,'utf-8')

        return Buffer.concat([buf_before,name_buf,buf_after])
    }


    getGrid(buf:Buffer){
        const name = this.getName(buf)

        const num_columns = buf.readUInt32LE(name.length + level_structure.header.col_num_start)
        const num_rows = buf.readUInt32LE(name.length + level_structure.header.row_num_start)

        const offset=level_structure.block_data.array_offset + name.length;
        const size_bytes = num_rows*num_columns*4;

        return new CellGrid(num_columns,num_rows,buf.slice(offset, offset+size_bytes),offset);
    }

    async analyze(buf:Buffer) {
        console.log("Level analysis started.")

        const lvl = new LevelDetails(buf)

        // get the name:
        // const name = this.getName(buf)
        console.log(`Level name: "${lvl.name}"`)
        const filename = lvl.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()

        await fs.writeFileSync(`${config.levels.bin_dir}/${filename}.kitty`, buf);
        console.log(`Saved raw to ${config.levels.bin_dir}/${filename}.kitty`)

        const filesize = buf.length
        console.log(`Size of file is ${filesize}`)

        const grid = lvl.grid;
        // const grid = this.getGrid(buf);

        console.log(`columns: ${grid.cols}`)
        console.log(`rows: ${grid.rows}`)

        console.log(`block array size: ${grid.buf.length} bytes`)
        console.log(`level size without name or array is ${filesize - lvl.name.length - grid.buf.length}`)
        console.log(`footer size ${filesize - lvl.name.length - grid.buf.length - level_structure.block_data.array_offset}`)


        // const post_grid_offset = level_structure.block_data.array_offset + name.length + grid.buf.length
        // const post_grid_array = buf.slice(post_grid_offset,post_grid_offset+grid.rows*grid.cols)
        const is_post_grid_zero = lvl.pgrid.isZero()
        // const is_post_grid_zero = Buffer.compare(post_grid_array,Buffer.alloc(grid.rows*grid.cols,0))
        console.log(`Is post_grid zero: ${is_post_grid_zero?'yes':'no'}`)
        // if(!is_post_grid_zero){
        //     console.log(lvl.pgrid.buf.toString('hex'))
        // }

        for(let call of lvl.callouts.callouts){
            console.log(`Callout for cell (${call.cell.i},${call.cell.j}): ${call.msg}`)
        }
        //
        // try{
        //     const callout_field_offset = post_grid_offset + grid.rows*grid.cols
        //     const should_be_1 = buf.readUInt32LE(callout_field_offset);
        //     console.log(`Should be 1: ${should_be_1}`)
        //     const size_of_callout_field = buf.readUInt32LE(callout_field_offset+4);
        //     console.log(`size_of_callout_field: ${size_of_callout_field}`)
        //     const n_callouts = buf.readUInt32LE(callout_field_offset+8);
        //     console.log(`Number callouts: ${n_callouts}`)
        //     let callout_running_offset = callout_field_offset+4+4+4;
        //     for(let i=0; i<n_callouts; i++){
        //         const x_coord = buf.readUInt32LE(callout_running_offset);
        //         callout_running_offset+=4;
        //         const y_coord = buf.readUInt32LE(callout_running_offset);
        //         callout_running_offset+=4;
        //         const n_bytes = buf.readUInt32LE(callout_running_offset);
        //         callout_running_offset+=4;
        //         const callout_text = buf.slice(callout_running_offset,callout_running_offset+n_bytes-1).toString('utf-8')
        //         callout_running_offset+=n_bytes;
        //         console.log(`Callout number ${i+1}, (${x_coord},${y_coord}): ${callout_text}`)
        //     }
        // }catch (e){
        //     console.log("Callout analysis failed:")
        //     console.log(e)
        // }

        // cell block bytes
        const cell_array_file = fs.createWriteStream(`${config.levels.bin_dir}/${filename}.cells.txt`)
        await cell_array_file.write("# Cell array in the same arrangement as in the level.\n")
        await cell_array_file.write("# the first number is decimal,\n")
        await cell_array_file.write("# the second number below is the hex representation BE in file order\n")
        await cell_array_file.write("# The third number is hex LE which is more human readable\n\n")
        await cell_array_file.write("# The fourth number is the post-grid value for the cell\n\n")

        // lets get some leaderboards ready to make a reference for fuzzing.
        const cell_values:{[key:number]:true}={}

        for (let j = 0; j < grid.rows; j++) {
            for (let i = 0; i < grid.cols; i++) {

                const full_cell_data = grid.getCellAsNumber(i,j)

                // add to leaderboard
                cell_values[full_cell_data]=true;


            }

            // write cell data as text array of integers
            for (let i = 0; i < grid.cols; i++) {
                const full_cell_data = grid.getCellAsNumber(i,j)

                await cell_array_file.write(full_cell_data.toString().padStart(9, '0') + "    ")
            }
            await cell_array_file.write("\n");

            // write cell data as text array of integers
            for (let i = 0; i < grid.cols; i++) {
                const buf = grid.getCellAsBuff(i,j)

                await cell_array_file.write(buf.toString('hex').padStart(9, ' ') + "    ")
            }
            await cell_array_file.write("\n");

            // write cell data as text array of integers
            for (let i = 0; i < grid.cols; i++) {
                const full_cell_data = grid.getCellAsNumber(i,j)

                const BEbuf = Buffer.alloc(4)
                BEbuf.writeUInt32BE(full_cell_data)
                await cell_array_file.write(BEbuf.toString('hex').padStart(9, ' ') + "    ")
            }
            await cell_array_file.write("\n");

            // write cell data as text array of integers
            for (let i = 0; i < grid.cols; i++) {
                const full_cell_data = lvl.pgrid.getCellAsNumber(i,j)

                await cell_array_file.write(full_cell_data.toString().padStart(9, ' ') + "    ")
            }


            await cell_array_file.write("\n\n\n");
        }

        const all_values = Object.keys(cell_values).map(k=>+k);
        fs.writeFileSync( `${config.levels.bin_dir}/${filename}.fuzz.json`,JSON.stringify(all_values))

        lvl.next10numbers()
    }
}