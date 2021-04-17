import {RWKpage, DB_file_hex, RWK_db} from "./rwkpage";
import config from "./config";
import fs from "fs";
import inquirer from "inquirer";
import {createCanvas, loadImage} from "canvas";
import {CellGrid, Level_analysis, LevelDetails} from "./level_analysis";
import {glob} from "glob";
import {Level} from "./level";

export const minimal_DB: {[key:string]:DB_file_hex} = {}
minimal_DB[`/RAPTISOFT_SANDBOX/RWK`]={"timestamp":1617120257370,"mode":16895}
minimal_DB[`/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64`]={"timestamp":1617120270089,"mode":16895}
minimal_DB[`/RAPTISOFT_SANDBOX/RWK/settings.txt`]={"timestamp":1617131809296,"mode":33206,"contents":"47726170686963732e5265736f6c7574696f6e3d3733362c3431340d0a47726170686963732e46756c6c73637265656e3d66616c73650d0a53797374656d2e4f533d5741534d0d0a53797374656d2e546f6b656e3d0d0a53797374656d2e436f6d70757465724e616d653d416e6f6e796d6f75730d0a53797374656d2e4950416464726573733d3132382e302e302e310d0a53797374656d2e4175746f436c6f75643d747275650d0a47726170686963732e53617665566964656f4d656d6f72793d66616c73650d0a4e65777356657273696f6e3d320d0a4c6173744e6577733d3c736574757020706164746f703d3235207061646c6566743d32352070616472696768743d323520706164626f74746f6d3d32353e3c666f6e74206e6f726d616c3e3c636f6c6f7220236434656366653e3c66696c6c6c696e652033303e3c636f6c6f7220233538613365363e3c73702031303e3c6d6f7665637572736f72202b302c2b333e4d6179203474682c20323031383c42523e3c42523e3c636f6c6f722077686974653e4e657720666561747572657320666f72204d616b65726d616c6c2077696c6c20736f6f6e20626520617661696c61626c65213c62723e3c666f6e7420736d616c6c3e3c62723e416e207570646174652069732063757272656e746c79206265696e67207075626c69736865642e20204166746572207468652075706461746520697320617661696c61626c65206f6e20616c6c20706c6174666f726d732c2077652077696c6c20656e61626c6520746865206e6577206665617475726573206f6e20746865207365727665722e3c42523e3c62723e3c666f6e74206e6f726d616c3e3c42523e3c666f6e74206e6f726d616c3e3c636f6c6f7220236434656366653e3c66696c6c6c696e652033303e3c636f6c6f7220233538613365363e3c73702031303e3c6d6f7665637572736f72202b302c2b333e4a616e756172792032326e642c20323031383c42523e3c42523e3c636f6c6f722077686974653e526f626f742057616e7473204b69747479206973206e6f7720617661696c61626c6520666f7220694f53313120616e6420416e64726f69642120204265207375726520746f207669736974204d616b6572204d616c6c20746f207365652077686174206b696e64206f66206c6576656c206372656174696f6e73206f7468657220706c61796572732068617665206265656e20757020746f213c42523e3c42523e3c666f6e7420736d616c6c3e44756520746f20363462697420696e636f6d7061746962696c6974792c20776520686176652068616420746f20636c656172206f7574204d616b65726d616c6c2e20204275742077652061726520776f726b696e67206f6e20612070726f6365737320746f2068656c7020706c61796572732077686f20686176652070726576696f75736c792075706c6f61646564206c6576656c7320676574207468656d206261636b212020576174636820746865204e4557532c207765276c6c206b65657020796f7520706f73746564213c42523e0d0a4e6577733d747275650d0a","content_type":"Int8Array"}
export const custom_level_key_root = `/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/`

export const level_base_obj = {
    timestamp:1617119662897,
    mode:33206,
    contents:"1000000000000000050000001c000000ffffffff05000000303030310000000000000000000000000000000000000000f60200000f0000000a00000000000000010000000100000001000000010000000100000001000000010000000100000001000000010000000100000001000000010000000100000000000000010000000200000002000000020000000200000002000000020000000200000002000000020000000200000002000000020000000100000001000000010000000200000002000000010000000100000001000000010000000100000001000000010000000100000001000000020000000100000001000000020000000200000002000000010000000100000001000000010000000100000001000000010000000100000001000000020000000100000001000000020000000200000002000000020000000100000001000000010000000000000001000000010000000100000001000000020000000100000001000000010000000100000001000000020000000200000001000000010000000000000001000000010000000100000001000000020000000100000000000000000000000000000001000000010000000200000001000000010000000100000001000000010000000100000001000000020000000100000000000000000000000000000000000000010000000200000001000000010000000100000001000000010000000100000001000000020000000100000000000000000000000000000001000000010000000200000002000000020000000200000002000000020000000200000002000000020000000100000000000000000000000000000000000000010000000100000001000000010000000100000001000000010000000100000001000000010000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000040000000000000000000000080000000000aa4300005a43000000000800000000000c430080934300000000530000000100000000010000000000000000000000000000000000000000000000006666663f0000000000000000b800bc0000000000000000000000000000000000003f0000003f0100000000010000000001000000000000000000000000",
    content_type:"Int8Array"
}

export class RWK_db_handler {
    db:RWK_db
    constructor(empty=false) {
        this.db={}
        if(!empty) {
            this.update(minimal_DB)
        }
    }
    addCustomKitty(buf:Buffer){
        console.log('db handler extract name')
        const name = new LevelDetails(buf).name
        console.log(`got name ${name}`)
        this.db[custom_level_key_root+name+".kitty"]={
            ...level_base_obj,
            contents:buf.toString('hex')
        }
    }
    update(odb:RWK_db){
        for(let key of Object.keys(odb)){
            this.db[key] = odb[key]
        }
    }

}

const tile_size={w:40,h:40}

const visible_grid_start_screen_coords = {x:18,y:1}
const start_x_control_area = 550
const lvlana = new Level_analysis()
const base_grid = lvlana.getGrid(Buffer.from(level_base_obj.contents,'hex'))
const cells_visible={
    first:{i:1,j:1},
    last:{i:13,j:8},
    //this masks out the control areas
    blacklist:[
        base_grid.getCellID(1,1),base_grid.getCellID(1,2), //test game button upper left

        base_grid.getCellID(8,4),base_grid.getCellID(8,5),//robot in middle

        // the movement area in the bottom
        base_grid.getCellID(1,5),base_grid.getCellID(2,5),base_grid.getCellID(3,5),
        base_grid.getCellID(1,6),base_grid.getCellID(2,6),base_grid.getCellID(3,6),base_grid.getCellID(4,6),
        base_grid.getCellID(1,7),base_grid.getCellID(2,7),base_grid.getCellID(3,7),base_grid.getCellID(4,7),
        base_grid.getCellID(1,8),base_grid.getCellID(2,8),base_grid.getCellID(3,8),base_grid.getCellID(4,8),

    ], //that's 87 cells per screenshot

    visible:{
        ul:{x:47,y:0},
        lr:{x:572,y:323},
    }
}
const first_level_cell_in_visible_grid = {i:1,j:1}
const last_level_cell_in_visible_grid={}

const byte_array_start = 0x38+4

const button_coords={
    makermall:{x:453,y:253},
    mylevels:{x:112,y:73},
    firstlevel:{x:187,y:171},
    testplay:{x:25,y:25},
    trash:{x:600,y:330},
    confirmtrash:{x:240,y:240},
}

interface FuzzCellAllocation {
    id:number,
    pos:{i:number,j:number},
    filename:string,
    fuzzval:number,


}

class FuzzLevel{

    buf:Buffer
    lvlanl:Level_analysis
    grid:CellGrid

    all_cell_list:{i:number,j:number}[]
    allocations:FuzzCellAllocation[]

    constructor(public name:string) {
        this.lvlanl = new Level_analysis()
        this.buf = this.lvlanl.setName( Buffer.from(level_base_obj.contents,'hex'), name)
        this.grid = this.lvlanl.getGrid(this.buf)
        this.all_cell_list = []
        for(let j=cells_visible.first.j; j<=cells_visible.last.j; j++)
        for(let i=cells_visible.first.i; i<=cells_visible.last.i; i++){
            const id = this.grid.getCellID(i,j)
            if(cells_visible.blacklist.indexOf(id)>=0){
                //cell is backlisted
                continue
            }
            this.all_cell_list.push( {i,j})
        }
        // console.log(`visible cells in level: ${this.all_cell_list.length}`)
        this.allocations=[]
    }

    hasFreeCells(){
        return (this.allocations.length < this.all_cell_list.length)
    }

    allocate(val:number,filename:string){
        const next_coord = this.all_cell_list[this.allocations.length]
        this.allocations.push({
            pos:next_coord,
            id:this.grid.getCellID(next_coord.i,next_coord.j),
            filename,
            fuzzval:val
        });
        this.grid.writeCellNumber(next_coord.i,next_coord.j,val);
        // console.log(`Allocated ${val}, ${filename}`)
    }

    getDBFile(){
        const fuzz_level = {...level_base_obj}
        fuzz_level.contents=this.buf.toString('hex')
        return fuzz_level
    }

    async processScreenshot(screenshot_file:string){

        const full = await loadImage(screenshot_file);
        const full_cv = createCanvas(full.width, full.height)
        const full_ctx = full_cv.getContext('2d')
        // all screen offsets are now 0,0
        full_ctx.translate(-cells_visible.visible.ul.x,-cells_visible.visible.ul.y)
        const h_scale = (tile_size.w*(cells_visible.last.i-cells_visible.first.i+1))/(cells_visible.visible.lr.x-cells_visible.visible.ul.x)
        const v_scale = (tile_size.h*(cells_visible.last.j-cells_visible.first.j+1))/(cells_visible.visible.lr.y-cells_visible.visible.ul.y)
        console.log(`transform of grid: ${h_scale},${v_scale}`)

        full_ctx.scale(h_scale,v_scale)
        full_ctx.drawImage(full, 0, 0)

        fs.writeFileSync( screenshot_file+".transform.png",full_cv.toBuffer('image/png'))

        for(let alloc of this.allocations){

            const tile_cv = createCanvas(tile_size.w, tile_size.h)
            const ctx = tile_cv.getContext('2d')

            //find out where in this screenshot my allocated tile is located.
            const pos = alloc.pos;
            const onscreen_i = pos.i - cells_visible.first.i
            const onscreen_j = pos.j - cells_visible.first.j



            const tile_x = onscreen_i*tile_size.w
            const tile_y = onscreen_j*tile_size.h


            await ctx.drawImage(full_cv,tile_x,tile_y,40,40,0,0,40,40)
            // await ctx.drawImage(full_ctx.getImageData(tile_position.x,tile_position.y,40,40),0,0)

            fs.writeFileSync( alloc.filename,tile_cv.toBuffer('image/png'))
            console.log(`Captured tile ${alloc.filename}`)
        }

    }

}

class RobotFuzzLevel{


    constructor(public name:string) {
    }

    hasFreeCells(){
        return false
    }

    allocate(val:number,filename:string){
        throw new Error("cannot allocate to robot level")
    }

    getDBFile(){
        // 8394112 is blank alu
        const lvl = new Level({
            name:this.name,
            grid:{x:20,y:20,val:8394112},
            robot:{x:180,y:220},
            kitty:{x:260,y:220},
        })

        const fuzz_level = {...level_base_obj}
        fuzz_level.contents=lvl.serialize().toString('hex')
        return fuzz_level
    }

    async processScreenshot(screenshot_file:string){

        // measured in paint.net from the screenshot:
        // robot ul 334,152
        // lr 371,200

        // kitty ul 409,178
        // kitty lr 451,204
        // let's cut these out

        const tasks = [
            {
                name:'robot',
                ul:{
                    x:334,
                    y:152
                },
                lr:{
                    x:372,
                    y:201
                }
            },
            {
                name:'kitty',
                ul:{
                    x:409,
                    y:178
                },
                lr:{
                    x:452,
                    y:205
                }
            },
        ]

        const full = await loadImage(screenshot_file);
        const full_cv = createCanvas(full.width, full.height)
        const full_ctx = full_cv.getContext('2d')
        full_ctx.drawImage(full, 0, 0)

        const pixel_tolerance = 10

        for(let task of tasks){
            const width = task.lr.x-task.ul.x
            const height = task.lr.y-task.ul.y
            const tile_cv = createCanvas(width, height)
            const ctx = tile_cv.getContext('2d')


            await ctx.drawImage(full_cv,task.ul.x,task.ul.y,width,height,0,0,width,height)

            // the canvas data will have to be manipulated to select the background and make it transparent.
            // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
            // https://github.com/Automattic/node-canvas/blob/master/examples/indexed-png-image-data.js

            const idata = ctx.getImageData(0,0,width,height)
            // we grab the color info of the top left pixel. We know this pixel is background.
            const [bkg_r,bkg_g,bkg_b,bkg_a] = [idata.data[0],idata.data[1],idata.data[2],idata.data[3]]
            // console.log(`bkg pixel: ${bkg_r}, ${bkg_g}, ${bkg_b}, ${bkg_a}, `)
            // now look through all pixels. if they match, make them transparent
            for(let i=0; i+3<idata.data.length ;i+=4){
                if(!(bkg_r-pixel_tolerance < idata.data[i+0] && idata.data[i+0]< bkg_r+pixel_tolerance)) continue;
                if(!(bkg_g-pixel_tolerance < idata.data[i+1] && idata.data[i+1]< bkg_g+pixel_tolerance)) continue;
                if(!(bkg_b-pixel_tolerance < idata.data[i+2] && idata.data[i+2]< bkg_b+pixel_tolerance)) continue;
                if(!(bkg_a-pixel_tolerance < idata.data[i+3] && idata.data[i+3]< bkg_a+pixel_tolerance)) continue;

                [idata.data[i+0],idata.data[i+1],idata.data[i+2],idata.data[i+3]]=[0,0,0,0]
            }
            ctx.putImageData(idata, 0, 0)

            fs.writeFileSync( `${config.fuzzer.tiles}/${task.name}.png`,tile_cv.toBuffer('image/png'))
            console.log(`Captured tile ${task.name}.png`)
        }


    }

}

class FuzzLevelLibrary{
    lvls:(FuzzLevel|RobotFuzzLevel)[]

    constructor() {
        this.lvls=[]
    }
    getCurrent(){
        // last lvls with free cells or new.
        if(!this.lvls.length || !this.lvls[this.lvls.length-1].hasFreeCells()){
            this.lvls.push(new FuzzLevel(`${this.lvls.length+1}`.padStart(4,"0")))
        }
        return this.lvls[this.lvls.length-1]
    }

    addRobotLevel(){
        this.lvls.push(new RobotFuzzLevel(`${this.lvls.length+1}`.padStart(4,"0")))
    }

    getFullDB(){
        const db = {...minimal_DB}
        for(let lvl of this.lvls){
            db[`${custom_level_key_root}${lvl.name}.kitty`] = lvl.getDBFile()
        }
        return db
    }

}

export class Fuzzer{

    constructor() {
        console.log("OK! Let's fuzz")

    }

    async fuzz(){
        if (!fs.existsSync(config.fuzzer.tmp)){fs.mkdirSync(config.fuzzer.tmp);}
        if (!fs.existsSync(`${config.fuzzer.tiles}`)){fs.mkdirSync(`${config.fuzzer.tiles}`);}


        const fuzz_all:{[key:number]:true}={}
        for(let fuzz_file of glob.sync(config.fuzzer.fuzz_files)){
            // console.log(`Pulling fuzz numbers from ${fuzz_file}`)
            for(let i of JSON.parse(fs.readFileSync(fuzz_file,'utf-8'))){
                fuzz_all[i]=true
            }
        }

        const fuzz_numbers = Object.keys(fuzz_all).map(i=>+i);
        console.log(`There are ${fuzz_numbers.length} numbers to fuzz`)

        const lib = new FuzzLevelLibrary()

        let count_allocations = 0
        // We now need to create a map of what tiles to fuzz
        for(let byteval of fuzz_numbers) {

            const buf = Buffer.alloc(4)
            buf.writeUInt32LE(byteval )
            // zero the fist 7 bits
            buf.writeUInt8( buf.readUInt8(0) & 0x80)
            // buf.fill(0,0,1)
            const tile_file = `${config.fuzzer.tiles}/${buf.toString('hex')}.png`
            // if tile exists, we don't need to fuzz it.
            if (fs.existsSync(tile_file)) continue

            // we now know
            // - fuzz value
            // - tile name

            //now:
            // - get the latest fuzz level with a free tile
            const lvl = lib.getCurrent()
            // - add this fuzz value and tile name to it
            lvl.allocate(byteval,tile_file)
            //   - keep track of which tile in the level was assigned.

            count_allocations++

        }

        // we also need to fuzz the robot and kitty tiles, which are very different
        if(!fs.existsSync(`${config.fuzzer.tiles}/robot.png`) || !fs.existsSync(`${config.fuzzer.tiles}/kitty.png`)){
            // we need to fuzz robot and kitty
            count_allocations+=2 // just for reporting
            lib.addRobotLevel()
        }

        if(!count_allocations){
            console.log("nothing to fuzz. You already have all recessary tiles.")
            return
        }

        console.log(`${count_allocations} tiles allocated to ${lib.lvls.length} levels`)

        const rwk = new RWKpage()
        await rwk.ready(config.fuzzer.headless);
        await rwk.load_minimal()

        console.log('minimal loaded')

        await rwk.restoreMemoryDB(lib.getFullDB())
        console.log('db restored')

        await rwk.load_full()

        await inquirer.prompt([{ type: 'input', name: 'ready', message: "Please wait until the game has loaded (don't touch anything), then press ENTER.",  }])

        //
        await rwk.clickOnCoord(button_coords.makermall) // first is for welcome splash screen
        await this.sleep(config.fuzzer.sleep)
        await rwk.clickOnCoord(button_coords.makermall)
        await this.sleep(config.fuzzer.sleep)
        await rwk.clickOnCoord(button_coords.mylevels)
        await this.sleep(config.fuzzer.sleep)

        for (let lvl of lib.lvls){
            await rwk.clickOnCoord(button_coords.firstlevel)
            await this.sleep(config.fuzzer.sleep)

            const screenshot_name = `${config.fuzzer.tmp}/${lvl.name}_screenshot.png`
            await rwk.screenshot(screenshot_name)
            console.log(`Took screenshot of test level ${lvl.name}`)
            lvl.processScreenshot(screenshot_name)

            await rwk.clickOnCoord(button_coords.trash)
            await this.sleep(config.fuzzer.sleep)
            await rwk.clickOnCoord(button_coords.confirmtrash)
            await this.sleep(config.fuzzer.sleep)
            await rwk.clickOnCoord(button_coords.confirmtrash)
            await this.sleep(config.fuzzer.sleep)

        }
        await rwk.close()



    }




    async sleep(ms:number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }


}

function robot(){
    function dummyTestLevel(){
        const lvl = new Level()
        lvl.name = "robot"
        lvl.robot.x = 180
        lvl.robot.y = 220
        lvl.kitty.x = 260
        lvl.kitty.y = 220
        fs.writeFileSync(`${config.db.levels_in}/${lvl.name}.kitty`,lvl.serialize())
    }
}

