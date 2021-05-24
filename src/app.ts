import config from './config'
import inquirer from 'inquirer'
import {RWKpage} from "./rwkpage";
import {glob} from "glob";
import * as fs from "fs";
import {CreateTilesets} from "./tileset";
import {extractLevelName, sav_to_lvl} from "./level";
import path from "path";
import {CLI_option} from "./cli";
import {RWK_db, RWK_db_handler} from "./db";


console.log("RWK Level Editor toolbox v2.0")


class CLI {
    options:{[key:string]:CLI_option};
    rwk:RWKpage
    constructor() {
        this.options={}
        if(process.argv[process.argv.length-1]=='dev'){
            this.options['r']={
                description: "(r)esource pack from ref",
                action:CreateTilesets,

            }
        }

        this.rwk = new RWKpage()

    }


    async start_CLI(){
        let exit = false;
        await this.rwk.ready();
        // if(this.rwk.DB_avaialble()){
        //     // restore the DB
        //     console.log("DB backup found.")
        //     await this.rwk.load_minimal();
        //     await this.rwk.restoreDB(config.db.backup);
        // }else{
        //     console.log("No DB backup found.")
        // }
        // await this.rwk.load_full();

        const inject = async ()=>{
            console.log(`Now restarting and restoring backup from ${config.db.backup}`)
            const db_handler = new RWK_db_handler()
            db_handler.load_file(config.db.backup)
            console.log('base DB loaded. Now adding levels to inject')

            for(let filename of glob.sync(config.db.levels_in+'/*.kitty')){
                console.log(`injecting ${filename}`)
                db_handler.addCustomKitty(fs.readFileSync(filename))
            }

            for(let filename of glob.sync(config.db.levels_in+'/*.sav')){
                console.log(`injecting ${filename}`)
                db_handler.addCustomSav(path.basename(filename),fs.readFileSync(filename))
            }

            console.log('all injections handled.')

            await this.rwk.load_minimal();
            await this.rwk.restoreMemoryDB(db_handler.db)
            await this.rwk.load_full();

        }

        const extract = async ()=>{
            console.log(`now saving DB backup to ${config.db.backup}, and levels to ${config.db.levels_out}`)
            const db:RWK_db = await this.rwk.extractDB()
            for(let key of Object.keys(db)){
                if( key.endsWith('.kitty')){
                    const buf = Buffer.from(db[key].contents!,'hex')
                    const name = extractLevelName(buf)
                    fs.writeFileSync(`${config.db.levels_out}/${name}.kitty`,buf)
                    //delete db[key]
                }
                if( key.endsWith('.sav') && config.db.extract_sav){
                    const buf = Buffer.from(db[key].contents!,'hex')
                    console.log(`treating sav: ${key}`)
                    // fs.writeFileSync(`${config.db.levels_out}/${path.basename(key)}.kitty`,sav_to_lvl(buf))
                    fs.writeFileSync(`${config.db.levels_out}/${path.basename(key)}`,buf)
                    //delete db[key]
                }
                if( key.endsWith('recent.levels') && config.db.extract_sav){
                    const buf = Buffer.from(db[key].contents!,'hex')
                    console.log(`treating sav: ${key}`)
                    // fs.writeFileSync(`${config.db.levels_out}/${path.basename(key)}.kitty`,sav_to_lvl(buf))
                    fs.writeFileSync(`${config.db.levels_out}/${path.basename(key)}`,buf)
                    //delete db[key]
                }

            }
            fs.writeFileSync(config.db.backup,JSON.stringify(db,null,2))

        }

        this.options['e']={
            description:"(e)xtract",
            action:extract
        }
        this.options['i']={
            description:"(i)nject",
            action:inject
        }


        this.options['q']={
            description: '(q)uit',
            action:async ()=>{
                console.log("Exiting...")
                exit=true;
                this.rwk.close()
            }
        };

        inject();

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