
import puppeteer, {Browser, Page} from 'puppeteer'
import config from "./config";
import {IDBPDatabase} from "idb";
import * as fs from "fs";
import { StatsStore} from "./sniffer";

interface DB_file_browser {
    timestamp:any,
    mode:number,
    contents?:Int8Array|Uint8Array,
}

interface DB_file_hex {
    timestamp:any,
    mode:number,
    contents?:string,
    content_type?:string,
}


export class RWKpage {
    browser:Browser | undefined;
    page: Page | undefined;

    stats: StatsStore

    constructor() {
        this.stats=new StatsStore()
    }
    async ready(){
        this.browser = await puppeteer.launch({headless: false});
        this.page = (await this.browser.pages())[0];

        this.stats.sniff(this.page);
    }

    async load_minimal(){
        // Start by opening just the page, without loading it. This sets the security context for IndexedDB
        await this.page?.goto(config.rwk_url,{waitUntil: 'domcontentloaded'});
        await this.page?.evaluate("window.stop();")

        return this.prepare_idb();

    }

    async load_full(){
        await this.page?.goto(config.rwk_url);


        // remove all the popups and adverts
        let div_selector_to_remove= "#cmpbox";
        await this.page!.waitForSelector(div_selector_to_remove)
        await this.page!.$eval(div_selector_to_remove,el=> {
            el.parentNode!.removeChild(el)
        });

        return this.prepare_idb();
    }

    async prepare_idb(){
        //found a good talk about IndexedDB here: https://filipvitas.medium.com/indexeddb-with-promises-and-async-await-3d047dddd313
        return this.page!.addScriptTag({ url: 'https://unpkg.com/idb/build/iife/index-min.js' });
    }

    async close(){
        await this.browser?.close();
    }

    async db_getAllKeys(){
        return await this.page!.evaluate(  async (config)=> {

            let db: IDBPDatabase;
            // @ts-ignore This works because of the script injection above
            db = await idb.openDB(config.db.name);
            return await db.getAllKeys(config.db.filestore);
        },config)
    }

    async db_getKey(key:string) {
        const obj_h: DB_file_hex = await this.page!.evaluate(async (config,key:string) => {
            function buf2hex(arr?:Uint8Array) {
                if(!arr) return undefined;
                return Array.prototype.map.call(new Uint8Array(arr.buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
            }

            let db: IDBPDatabase;
            // @ts-ignore This works because of the script injection above
            db = await idb.openDB(config.db.name);

            const obj= await db.get(config.db.filestore, key);
            obj.timestamp=+obj.timestamp
            if(typeof obj.contents != "undefined"){
                obj.content_type = (obj.contents.constructor === Uint8Array)?"Uint8Array":"Int8Array";
                obj.contents = buf2hex(obj.contents);
            }
            return obj;
        }, config, key);



        return obj_h;
    }

    async db_addKey(key:string, obj_h:DB_file_hex) {
        // console.log("asked to put key, object:")
        // console.log(key)
        // console.log(obj_h)

        await this.page!.evaluate(async (config,key:string,obj_h:DB_file_hex) => {

            let db: IDBPDatabase;
            // @ts-ignore This works because of the script injection above
            db = await idb.openDB(config.db.name,21,{
                upgrade(db: IDBPDatabase) {
                    const store = db.createObjectStore(config.db.filestore,);
                    store.createIndex('timestamp','timestamp');
                },
            });

            const obj:DB_file_browser = {timestamp:new Date(obj_h.timestamp), mode:obj_h.mode}
            if(typeof obj_h.contents != 'undefined') {
                const arr: string = obj_h.contents!;
                const constructor = (obj_h.content_type == "Int8Array") ? Int8Array : Uint8Array;
                if (!arr){
                    obj.contents = new constructor();
                }
                else{
                    obj.contents = new constructor(arr.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
                }
            }
            try{
                // @ts-ignore
                await db.put(config.db.filestore, obj,key);

            }catch (e){
                // @ts-ignore
                await db.add(config.db.filestore, obj,key);

            }
            // @ts-ignore
        }, config, key, obj_h);

    }

    async screenshot(path:string){
        const elements = await this.page!.$$("#canvas");

        await elements[0].screenshot({path})
    }

    async restoreDB(path:string,prefix?:string){
        if(!prefix) prefix = config.db.name;

        const files = fs.readdirSync(path,{withFileTypes:true});
        for(let i=0; i<files.length; i++){
            const file = files[i];
            if(file.isDirectory()){
                await this.restoreDB(path+"/"+file.name, prefix+"/"+file.name)
            }else{
                //is file
                if(!file.name.endsWith('.json')){
                    console.log("ignoring non json files in backup")
                    continue
                }
                const data:DB_file_hex = JSON.parse(fs.readFileSync(path+"/"+file.name, 'utf8'));
                await this.db_addKey(`${prefix}/${file.name.replace('.json','')}`,data);
            }
        }

        //         // upload an empty object
        //         const obj = { timestamp: {}, mode: 16895 }
        //         this.d
        //     }
        // }
    }
}
