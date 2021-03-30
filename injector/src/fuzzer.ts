import {RWKpage} from "./rwkpage";
import config from "./config";
import fs from "fs";
import inquirer from "inquirer";
import {PNG, PNGWithMetadata} from 'pngjs'
import pixelmatch from 'pixelmatch'
import rimraf from "rimraf";
import path from "path";
import {createCanvas, loadImage} from "canvas";

const minimal_DB: {[key:string]:any} = {}
minimal_DB[`RWK.json`]={"timestamp":1617120257370,"mode":16895}
minimal_DB[`RWK/EXTRALEVELS64.json`]={"timestamp":1617120270089,"mode":16895}
minimal_DB[`RWK/settings.txt.json`]={"timestamp":1617131809296,"mode":33206,"contents":"47726170686963732e5265736f6c7574696f6e3d3733362c3431340d0a47726170686963732e46756c6c73637265656e3d66616c73650d0a53797374656d2e4f533d5741534d0d0a53797374656d2e546f6b656e3d0d0a53797374656d2e436f6d70757465724e616d653d416e6f6e796d6f75730d0a53797374656d2e4950416464726573733d3132382e302e302e310d0a53797374656d2e4175746f436c6f75643d747275650d0a47726170686963732e53617665566964656f4d656d6f72793d66616c73650d0a4e65777356657273696f6e3d320d0a4c6173744e6577733d3c736574757020706164746f703d3235207061646c6566743d32352070616472696768743d323520706164626f74746f6d3d32353e3c666f6e74206e6f726d616c3e3c636f6c6f7220236434656366653e3c66696c6c6c696e652033303e3c636f6c6f7220233538613365363e3c73702031303e3c6d6f7665637572736f72202b302c2b333e4d6179203474682c20323031383c42523e3c42523e3c636f6c6f722077686974653e4e657720666561747572657320666f72204d616b65726d616c6c2077696c6c20736f6f6e20626520617661696c61626c65213c62723e3c666f6e7420736d616c6c3e3c62723e416e207570646174652069732063757272656e746c79206265696e67207075626c69736865642e20204166746572207468652075706461746520697320617661696c61626c65206f6e20616c6c20706c6174666f726d732c2077652077696c6c20656e61626c6520746865206e6577206665617475726573206f6e20746865207365727665722e3c42523e3c62723e3c666f6e74206e6f726d616c3e3c42523e3c666f6e74206e6f726d616c3e3c636f6c6f7220236434656366653e3c66696c6c6c696e652033303e3c636f6c6f7220233538613365363e3c73702031303e3c6d6f7665637572736f72202b302c2b333e4a616e756172792032326e642c20323031383c42523e3c42523e3c636f6c6f722077686974653e526f626f742057616e7473204b69747479206973206e6f7720617661696c61626c6520666f7220694f53313120616e6420416e64726f69642120204265207375726520746f207669736974204d616b6572204d616c6c20746f207365652077686174206b696e64206f66206c6576656c206372656174696f6e73206f7468657220706c61796572732068617665206265656e20757020746f213c42523e3c42523e3c666f6e7420736d616c6c3e44756520746f20363462697420696e636f6d7061746962696c6974792c20776520686176652068616420746f20636c656172206f7574204d616b65726d616c6c2e20204275742077652061726520776f726b696e67206f6e20612070726f6365737320746f2068656c7020706c61796572732077686f20686176652070726576696f75736c792075706c6f61646564206c6576656c7320676574207468656d206261636b212020576174636820746865204e4557532c207765276c6c206b65657020796f7520706f73746564213c42523e0d0a4e6577733d747275650d0a","content_type":"Int8Array"}
const base_level_key = `RWK/EXTRALEVELS64/1.kitty.json`

const base_level = {
    timestamp:1617119662897,
    mode:33206,
    contents:"10000000000000000500000019000000ffffffff02000000310000000000000000000000000000000000000000660100000a00000007000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000100000001000000010000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000040000000000000000000000080000000000344300005a430000000008000000000082430000584300000000530000000100000000010000000000000000000000000000000000000000000000006666663f00000000000000000000000000000000000000000000000000000000003f0000003f0100000000010000000001000000000000000000000000",
    content_type:"Int8Array"
}

const byte_index_to_fuzz=0x38+1+35*4 // of data array

const button_coords={
    makermall:{x:453,y:253},
    mylevels:{x:112,y:73},
    firstlevel:{x:187,y:171},
    testplay:{x:25,y:25}
}
const tile_position= {x:340,y:81}

export class Fuzzer{
    rwk:RWKpage

    startpage: PNGWithMetadata|undefined;

    constructor(rwk:RWKpage) {
        console.log("OK! Let's fuzz")
        this.rwk=rwk;
    }

    async fuzz(){
        console.log("Checking reference data.")
        if (!fs.existsSync(config.fuzzer.dir)){fs.mkdirSync(config.fuzzer.dir);}
        if (!fs.existsSync(`${config.fuzzer.dir}/${config.fuzzer.screen.dir}`)){fs.mkdirSync(`${config.fuzzer.dir}/${config.fuzzer.screen.dir}`);}
        if (!fs.existsSync(`${config.fuzzer.dir}/${config.fuzzer.tiles}`)){fs.mkdirSync(`${config.fuzzer.dir}/${config.fuzzer.tiles}`);}

        await this.rwk.ready(config.fuzzer.headless);
        await this.rwk.load_full();

        if(!fs.existsSync(`${config.fuzzer.dir}/${config.fuzzer.screen.dir}/${config.fuzzer.screen.start}`)){
            await inquirer.prompt([{ type: 'input', name: 'ready', message: "Please wait until the game has loaded (don't touch anything), then press ENTER.",  }])
            await this.rwk.screenshot(`${config.fuzzer.dir}/${config.fuzzer.screen.dir}/${config.fuzzer.screen.start}`);
        }
        this.startpage = PNG.sync.read(fs.readFileSync(`${config.fuzzer.dir}/${config.fuzzer.screen.dir}/${config.fuzzer.screen.start}`));
        console.log("Reference data OK.")

        // Let's prepare the value that we want to fuzz:
        const fuzz_file = `${config.fuzzer.dir}/${config.fuzzer.fuzz_file}`
        if(!fs.existsSync(fuzz_file)){
            console.log(`Please provide a list of number in ${config.fuzzer.dir}/${config.fuzzer.fuzz_file} with values to fuzz`)
            return
        }

        const fuzz_numbers = JSON.parse(fs.readFileSync(fuzz_file,'utf-8'));

        let limit = 3000;
        for(let byteval of fuzz_numbers){
            const buf = Buffer.alloc(4)
            buf.writeUInt32LE(byteval)
            const tile_file = `${config.fuzzer.dir}/${config.fuzzer.tiles}/${buf.toString('hex')}.png`

            if(fs.existsSync(tile_file)) continue
            console.log(`Processing ${tile_file}`)

            await this.rwk.load_minimal()
            await this.rwk.restoreDB(await this.prepare_db_with_fuzzval(byteval))
            await this.rwk.load_full()
            await this.wait_for_app_load()

            this.rwk.clickOnCoord(button_coords.makermall) // first is for welcome splash screen
            await this.sleep(300)
            this.rwk.clickOnCoord(button_coords.makermall)
            await this.sleep(300)
            this.rwk.clickOnCoord(button_coords.mylevels)
            await this.sleep(300)
            this.rwk.clickOnCoord(button_coords.firstlevel)
            await this.sleep(300)
            // this.rwk.clickOnCoord(button_coords.testplay)
            // await this.sleep(1000)

            await this.rwk.screenshot(tile_file)
            this.reapackage_tile(tile_file)
            limit--;
            if(!limit) break
        }

        await this.rwk.close()

    }

    async reapackage_tile(path:string){
        const full = await loadImage(path);
        const full_cv = createCanvas(full.width, full.height)
        const full_ctx = full_cv.getContext('2d')
        await full_ctx.drawImage(full,0,0)



        const tile_cv = createCanvas(40, 40)
        const ctx = tile_cv.getContext('2d')
        await ctx.drawImage(full_cv,tile_position.x,tile_position.y,40,40,0,0,40,40)
        // await ctx.drawImage(full_ctx.getImageData(tile_position.x,tile_position.y,40,40),0,0)

        fs.writeFileSync( path,tile_cv.toBuffer('image/png'))
    }

    async wait_for_app_load(){
        while(true) {
            await this.sleep(400);
            await this.rwk.screenshot(`${config.fuzzer.dir}/tmp.png`);
            const current = PNG.sync.read(fs.readFileSync(`${config.fuzzer.dir}/tmp.png`));
            if(current.width != this.startpage!.width || current.height != this.startpage!.height){
                //console.log("Size mismatch. Probably not ready yet")
                continue
            }
            const {width, height} = current;

            const diff = pixelmatch(current.data, this.startpage!.data, null, width, height, {threshold: 0.1});
            //console.log(`diff was ${diff}`)
            if(diff < 1000){
                break
            }
        }

    }

    async sleep(ms:number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async prepare_db_with_fuzzval(val:number){
        const db = `${config.fuzzer.dir}/${config.fuzzer.db}`
        //clear the temp db
        rimraf.sync(`${db}/*`);

        // write the base DB
        for(let key of Object.keys(minimal_DB)){
            const dir = db+"/"+ path.dirname(key);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true});
            }
            fs.writeFileSync(`${db}/${key}`, JSON.stringify(minimal_DB[key]));
        }
        //write the fuzz file:
        const base_buf = Buffer.from(base_level.contents,'hex')
        base_buf.writeUInt32LE(val,byte_index_to_fuzz)

        const fuzz_level = {...base_level}
        fuzz_level.contents=base_buf.toString('hex')

        const dir = db+"/"+ path.dirname(base_level_key);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        // fs.writeFileSync(`${db}/${base_level_key}`, JSON.stringify(base_level));
        fs.writeFileSync(`${db}/${base_level_key}`, JSON.stringify(fuzz_level));

        return db
    }


}