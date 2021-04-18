
import config from './config'


console.log("RWK Level Editor toolbox v1.0")

import inquirer from 'inquirer'
import {RWK_db, RWKpage} from "./rwkpage";
// import { LevelDetails} from "./level_analysis";
import {custom_level_key_root, Fuzzer, RWK_db_handler} from "./fuzzer";
import {glob} from "glob";
import * as fs from "fs";
import {Tileset} from "./tileset";
import {Tile_library} from "./tile_library";
import {convertAllLevels} from "./converter";
import path from "path";
import {extractLevelName, Level} from "./level";

interface CLI_option {
    description:string,
    action: ()=>Promise<void>,
}

class CLI {
    options:{[key:string]:CLI_option};
    constructor() {


        this.options={}
        this.options['s']={
            description:'(s)tart game',
            action:async ()=>{
                const rwk = new RWKpage()
                await rwk.ready();
                if(rwk.DB_avaialble()){
                    // restore the DB
                    console.log("DB backup found.")
                    await rwk.load_minimal();
                    await rwk.restoreDB(config.db.backup);
                }else{
                    console.log("No DB backup found.")
                }
                await rwk.load_full();

                // the game is now started. this options makes no sense any more.
                delete this.options['s']

                this.options['e']={
                    description:"(e)xtract",
                    action:async ()=>{
                        console.log(`now saving DB backup to ${config.db.backup}, and levels to ${config.db.levels_out}`)
                        const db:RWK_db = await rwk.extractDB()
                        for(let key of Object.keys(db)){
                            if( key.endsWith('.kitty')){
                                const buf = Buffer.from(db[key].contents!,'hex')
                                const name = extractLevelName(buf)
                                fs.writeFileSync(`${config.db.levels_out}/${name}.kitty`,buf)
                                //delete db[key]
                            }
                        }
                        fs.writeFileSync(config.db.backup,JSON.stringify(db,null,2))

                    }
                }
                this.options['i']={
                    description:"(i)nject",
                    action:async ()=>{
                        //inject
                        console.log(`Now restarting and restoring backup from ${config.db.backup}`)
                        const db_handler = new RWK_db_handler()
                        if(fs.existsSync(config.db.backup))
                            db_handler.update( JSON.parse(fs.readFileSync(config.db.backup,'utf-8')))
                        console.log('base DB loaded. Now adding levels to inject')
                        for(let filename of glob.sync(config.db.levels_in+'/*.kitty')){
                            console.log(`injecting ${filename}`)
                            db_handler.addCustomKitty(fs.readFileSync(filename))
                        }
                        console.log('all injections handled.')

                        await rwk.load_minimal();
                        await rwk.restoreMemoryDB(db_handler.db)
                        await rwk.load_full();

                    }
                }


            }
        }


        this.options['c']={
            description: "(c)onvert levels",
            action:async ()=>{
                await convertAllLevels()
            }
        }

        this.options['f']={
            description: "(f)uzz",
            action: async ()=>{
                const tilelib = new Tile_library()
                await tilelib.download_tile_library()
                const fuzz = new Fuzzer();
                await fuzz.fuzz()

            }
        }


        if(process.argv[process.argv.length-1]=='dev'){
            this.options['r']={
                description: "(r)esource pack from ref",
                action:async ()=>{
                    for(let reflvl of glob.sync(config.dev.base_levels+"/*")){
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
                        const tileset = new Tileset(lvl.name)
                        for(let i = 0; i<lvl.grid.size_x; i+=magic_skip){
                            // const tileval = lvl.grid.getCellAsNumber(j,magic_row)
                            let val = lvl.grid.getCell(i,magic_row)
                            // const buf = lvl.grid.getCellAsBuff(i,magic_row)

                            // extra special hack for the base tile set coming up:
                            const is_base_tileset = reflvl.endsWith("base.kitty")
                            if(!is_base_tileset)
                                val = val & 0xffffff80
                            //in the base tileset we actually want to have the full tile type.
                            // for all other tilesets, we only want the paint part and unpainted cells might as well be 0
                            if(val){
                                const buf = Buffer.alloc(4,0)
                                buf.writeUInt32LE(val)
                                tileset.addTile(val,`../${config.editor.tiles}/${buf.toString('hex')}.png`)
                            }
                        }


                        fs.writeFileSync(`${config.editor.resources}/${config.editor.tilesets}/${lvl.name}.json`,JSON.stringify(tileset.getTileset(),null,2))
                        fs.writeFileSync(`${config.editor.resources}/${config.editor.fuzz}/${lvl.name}.fuzz.json`,JSON.stringify(tileset.getValues(),null,2))
                    }
                }
            }
        }

    }


    async start_CLI(){
        let exit = false;
        this.options['q']={
            description: '(q)uit',
            action:async ()=>{
                console.log("Exiting...")
                exit=true;
            }
        };

        while (!exit){
            let question = Object.values(this.options).map(o=>o.description).join(",")+"?"
            const next_action = (await inquirer.prompt([{ type: 'input', name: 'ready', message: question,  }])).ready;
            const option = this.options[next_action];
            if(!option) continue;
            await option.action();
        }
    }
}


(async () => {
    const cli = new CLI();
    await cli.start_CLI();

})();