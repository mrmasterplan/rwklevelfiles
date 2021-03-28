
import config from './config'
import path from 'path'

console.log("RWK Level injector v1.0")

import inquirer from 'inquirer'
import fs from 'fs'
import {RWKpage} from "./rwkpage";
import rimraf from "rimraf";



(async () => {
    const rwk = new RWKpage();
    await rwk.ready();
    await rwk.load_minimal();

    // Check if we have a DB to restore
    let DBfiles = fs.readdirSync(config.db.backup,{withFileTypes:true});

    if(DBfiles.length){
        // restore the DB
        console.log("DB backup found.")
        await rwk.restoreDB(config.db.backup);
    }else{
        console.log("No DB backup found.")
    }

    // resotre the DB
    await rwk.load_full();

    while(true) {

        const next_action = (await inquirer.prompt([{ type: 'input', name: 'ready', message: "(e)xtract, (i)nject, (s)creenshot, (q)uit?",  }])).ready;
        let exit = false;
        switch(next_action) {
            case 'e': {
                // extract
                console.log(`now saving DB backup to ${config.db.backup}`)
                //clear the backup
                rimraf.sync(config.db.backup + '/*');

                // dump the DB
                const allkeys = await rwk.db_getAllKeys();
                for (let i = 0; i < allkeys.length; i++) {
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

                break;
            }
            case 'i': {
                //inject
                console.log(`Now restarting and restoring backup from ${config.db.backup}`)

                await rwk.load_minimal();
                await rwk.restoreDB(config.db.backup);
                await rwk.load_full();

                break;
            }
            case 's': {
                //screenshot
                const path = `${config.screenshots_dir}/${new Date().toISOString().replace(/:/,'.')}.png`;
                console.log(`Saving screenshot ${path}`);
                await rwk.screenshot(path);
                break;
            }
            default: {

                exit=true;
                break;
            }
        }
        if(exit) break;
        console.log("Exiting..")

    }

    rwk.close();
})();