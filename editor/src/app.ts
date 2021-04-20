
import config from './config'


console.log("RWK Level Editor toolbox v1.0")

import inquirer from 'inquirer'
import {RWK_db, RWKpage} from "./rwkpage";
// import { LevelDetails} from "./level_analysis";
import {custom_level_key_root, Fuzzer, RWK_db_handler} from "./fuzzer";
import {glob} from "glob";
import * as fs from "fs";
import {CreateTilesets, Tileset} from "./tileset";
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
                action:CreateTilesets,

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