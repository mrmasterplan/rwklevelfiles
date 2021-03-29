
import config from './config'
import path from 'path'

console.log("RWK Level injector v1.0")

import inquirer from 'inquirer'
import fs from 'fs'
import {RWKpage} from "./rwkpage";
import rimraf from "rimraf";
import {Level_analysis} from "./level_analysis";

interface CLI_option {
    description:string,
    action: ()=>Promise<void>,
}

class CLI {
    rwk: RWKpage;
    anlzr: Level_analysis
    options:{[key:string]:CLI_option};
    constructor() {
        this.rwk = new RWKpage()


        this.options={}
        this.options['s']={
            description:'(s)tart game',
            action:async ()=>{
                await this.rwk.ready();
                if(this.rwk.DB_avaialble()){
                    // restore the DB
                    console.log("DB backup found.")
                    await this.rwk.load_minimal();
                    await this.rwk.restoreDB(config.db.backup);
                }else{
                    console.log("No DB backup found.")
                }
                await this.rwk.load_full();

                // the game is now started. this options makes no sense any more.
                delete this.options['s']

                this.options['e']={
                    description:"(e)xtract",
                    action:async ()=>{
                        console.log(`now saving DB backup to ${config.db.backup}`)
                        await this.rwk.backupDB(config.db.backup)
                    }
                }
                this.options['i']={
                    description:"(i)nject",
                    action:async ()=>{
                        //inject
                        console.log(`Now restarting and restoring backup from ${config.db.backup}`)

                        await this.rwk.load_minimal();
                        await this.rwk.restoreDB(config.db.backup);
                        await this.rwk.load_full();

                    }
                }
                this.options['s']={
                    description:"(s)creenshot",
                    action:async ()=>{
                        const path = `${config.screenshots_dir}/${new Date().toISOString().replace(/:/,'.')}.png`;
                        console.log(`Saving screenshot ${path}`);
                        await this.rwk.screenshot(path);
                    }
                }


            }
        }

        this.anlzr = new Level_analysis();
        this.options['a']={
            description: "(a)nalyze",
            action: async ()=>{
                await this.anlzr.ready();
                await this.anlzr.parse_backup();
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
        await this.rwk.close()
    }
}


(async () => {
    const cli = new CLI();
    await cli.start_CLI();

})();