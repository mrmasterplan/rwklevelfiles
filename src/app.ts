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
import {kittyContributor} from "./kitty";
import {SavContributor} from "./sav";


console.log("RWK Level Editor toolbox v2.0")


class CLI {
    options:{[key:string]:CLI_option};
    rwk:RWKpage
    db:RWK_db_handler
    constructor() {
        this.options={}
        if(process.argv[process.argv.length-1]=='dev'){
            this.options['r']={
                description: "(r)esource pack from ref",
                action:CreateTilesets,

            }
        }

        this.rwk = new RWKpage()
        this.db = new RWK_db_handler()
        new kittyContributor(this.db)
        new SavContributor(this.db)

    }


    async start_CLI(){
        let exit = false;
        await this.rwk.ready();

        const inject = async ()=>{
            console.log(`Now restarting and restoring backup from ${config.db.backup}`)

            await this.db.load_file(config.db.backup)

            await this.rwk.load_minimal();
            await this.rwk.restoreMemoryDB(this.db.db)
            await this.rwk.load_full();

        }

        const extract = async ()=>{
            console.log(`now saving DB backup to ${config.db.backup}, and levels to ${config.db.levels_out}`)
            this.db.reset()
            this.db.update( await this.rwk.extractDB())
            this.db.dump_file(config.db.backup)
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