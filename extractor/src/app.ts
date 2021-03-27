
console.log("RWK Level extractor v1.0")

import puppeteer from 'puppeteer'
import inquirer from 'inquirer'
import { IDBPDatabase } from 'idb';
import fs from 'fs'

function toHexString(byteArray:number[]) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(' ')
}

(async () => {

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('http://robotwantskitty.com/web/');

    let div_selector_to_remove= "#cmpbox";
    await page.evaluate((sel) => {
        var elements = document.querySelectorAll(sel);
        for(var i=0; i< elements.length; i++){
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, div_selector_to_remove)


    //found a good talk about IndexedDB here: https://filipvitas.medium.com/indexeddb-with-promises-and-async-await-3d047dddd313
    await page.addScriptTag({ url: 'https://unpkg.com/idb/build/iife/index-min.js' });
    await inquirer.prompt([{ type: 'input', name: 'ready', message: "Is the game ready?",  }]);

    //list keys from the database.
    // I assume that if I restore all of these before the page loads,
    // the game won't show the prompt.
    const allkeys = await  page.evaluate(  async ()=>{

        let db:IDBPDatabase;
        // @ts-ignore This works because of the script injection above
        db = await idb.openDB("/RAPTISOFT_SANDBOX");
        return await db.getAllKeys("FILE_DATA");
    });
    console.log(allkeys);

    while(true) {
        const level_name = (await inquirer.prompt([{ type: 'input', name: 'ready', message: "What is your level called? (Blank to quit)",  }])).ready;
        if(!level_name) break;

        const level = await page.evaluate(async (level_name) => {

            let db: IDBPDatabase;
            // @ts-ignore This works because of the script injection above
            db = await idb.openDB("/RAPTISOFT_SANDBOX");
            const key_name = `/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/${level_name}.kitty`
            console.log(level_name);
            console.log(key_name);
            return await db.get("FILE_DATA", key_name);
            // return await db.get("FILE_DATA",`/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/${level_name}.kitty`);
        }, level_name);

        const bytes: number[] = Object.values(level.contents);
        const hex_string = toHexString(bytes);
        fs.writeFile(`levels/${level_name}.kitty`,hex_string,(err)=>{ if(err) throw err;});
        delete level.contents;

        console.log(level);

        await inquirer.prompt([{ type: 'input', name: 'ready', message: "Ready for screenshot?",  }]);
        (await page.$$("#canvas"))[0].screenshot({path:`levels/${level_name}.png`})

    }


    await browser.close();
})();