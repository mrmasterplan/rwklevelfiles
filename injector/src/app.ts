
import config from './config'
import path from 'path'

console.log("RWK Level injector v1.0")

import puppeteer, {Page} from 'puppeteer'
import inquirer from 'inquirer'
import { IDBPDatabase } from 'idb';
import fs from 'fs'
import {RWKpage} from "./rwkpage";



(async () => {
    const rwk = new RWKpage();
    await rwk.ready();
    await rwk.load_minimal();

    // Check if we have a DB to restore
    let DBfiles = fs.readdirSync(config.db.backup,{withFileTypes:true});
    if(!DBfiles.length){
        console.log("There is no database backup saved.");
        await rwk.load_full();
        await inquirer.prompt([{ type: 'input', name: 'ready', message: "Is the game to create a backup DB?" }]);

        // dump the DB
        const allkeys = await rwk.db_getAllKeys();
        for(let i=0; i<allkeys.length; i++) {
            const key = allkeys[i].toString();
            console.log(key);
            const obj = await rwk.db_getKey(key);
            //console.log(obj);
            const filename = config.db.backup + '/' + key.replace(config.db.name, '');

            const dir = path.dirname(filename);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true});
            }
            fs.writeFile(filename + '.json', JSON.stringify(obj), (err) => {
                if (err) throw err;
            });
        }
    }else{
        // restore the DB
        console.log(DBfiles)
        await rwk.restoreDB(config.db.backup);
        //await inquirer.prompt([{ type: 'input', name: 'ready', message: "DB restored?" }]);

    }

    // resotre the DB
    await rwk.load_full();

    while(true) {
        const level_name = (await inquirer.prompt([{ type: 'input', name: 'ready', message: "What is your level called? (Blank to quit)",  }])).ready;
        if(!level_name) break;

        const level = await rwk.db_getKey(`/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/${level_name}.kitty`);

        fs.writeFile(`levels/${level_name}.kitty`,level.contents!,(err)=>{ if(err) throw err;});
        delete level.contents;

        console.log(level);

        await inquirer.prompt([{ type: 'input', name: 'ready', message: "Ready for screenshot?",  }]);
        await rwk.screenshot(`levels/${level_name}.png`);

    }

    rwk.close();
})();