
import puppeteer, {Browser, Page} from 'puppeteer'
import config from "./config";
import {IDBPDatabase} from "idb";
import * as fs from "fs";

// import {Level_analysis} from "./level_analysis";

interface DB_file_browser {
    timestamp:any,
    mode:number,
    contents?:Int8Array|Uint8Array,
}

export interface RWK_db {[key:string]:DB_file_hex}

export interface DB_file_hex {
    timestamp:number,
    mode:number,
    contents?:string,
    content_type?:string,
}


export class RWKpage {
    browser:Browser | undefined;
    page: Page | undefined;

    // anlyzer: Level_analysis

    constructor() {

        // this.anlyzer = new Level_analysis();
    }
    async ready(headless=false){
        // await this.anlyzer.ready();

        this.browser = await puppeteer.launch({headless});
        this.page = (await this.browser.pages())[0];
        await this.page.setRequestInterception(true)
        this.page.on('request', (request) => {
            if (request.url().endsWith('.js') && !(request.url().startsWith('http://robotwantskitty.com')|| request.url().startsWith('https://unpkg.com/idb'))) {
                request.respond({
                    status: 200,
                    contentType: 'application/javascript; charset=utf-8',
                    body: `console.log("blocked ${request.url()}");`
                });
            } else {
                request.continue();
            }
        });


    }

    async load_minimal(){
        // Start by opening just the page, without loading it. This sets the security context for IndexedDB
        await this.page?.goto(config.rwk_url,{waitUntil: 'domcontentloaded'});
        await this.page?.evaluate("window.stop();")

        return this.prepare_idb();

    }

    async load_full(){
        await this.page?.goto(config.rwk_url);


        // // remove all the popups and adverts
        // let div_selector_to_remove= "#cmpbox";
        // await this.page!.waitForSelector(div_selector_to_remove)
        // await this.page!.$eval(div_selector_to_remove,el=> {
        //     el.parentNode!.removeChild(el)
        // });

        return this.prepare_idb();
    }

    async prepare_idb(){
        // found a good talk about IndexedDB here: https://filipvitas.medium.com/indexeddb-with-promises-and-async-await-3d047dddd313
        // this injects a script needed by all the db interactions below

        await this.page!.addScriptTag({ url: 'https://unpkg.com/idb/build/iife/index-min.js' });

        //https://www.sqlpac.com/en/documents/javascript-listing-active-event-listeners.html
        //window.onload = undefined
        //document.body.onload = undefined
        function listAllEventListeners() {
            const allElements = Array.prototype.slice.call(document.querySelectorAll('*'));
            allElements.push(document);
            allElements.push(window);

            const types = [];

            for (let ev in window) {
                if (/^on/.test(ev)) types[types.length] = ev;
            }

            let elements = [];
            for (let i = 0; i < allElements.length; i++) {
                const currentElement = allElements[i];
                for (let j = 0; j < types.length; j++) {
                    if (typeof currentElement[types[j]] === 'function') {
                        if (currentElement.toString() ==='windows' && types[j].toString() ==='onload') currentElement[types[j]]=()=>{}
                        if (currentElement.toString() ==='body' && types[j].toString() ==='onload') currentElement[types[j]]=()=>{}

                    }
                }
            }


        }
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
            obj.timestamp= +obj.timestamp
            if(typeof obj.contents != "undefined"){
                obj.content_type = (obj.contents.constructor === Uint8Array)?"Uint8Array":"Int8Array";
                obj.contents = buf2hex(obj.contents);
            }
            return obj;
        }, config, key);



        return obj_h;
    }

    async db_addKey(key:string, obj_h:DB_file_hex) {
        // console.log(`Restoring DB key ${key}`)

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

    async  clickOnCoord(coords:{x:number,y:number}) {
        const element = await this.page!.$("#canvas");


        const rect = await this.page!.evaluate(el => {
            const { top, left, width, height } = el.getBoundingClientRect();
            return { top, left, width, height };
        }, element);

        // Use given position or default to center
        const _x = coords.x !== null ? coords.x : rect.width / 2;
        const _y = coords.y !== null ? coords.y : rect.height / 2;

        await this.page!.mouse.click(rect.left + _x, rect.top + _y);
    }


    async screenshot(path:string){
        const element = await this.page!.$("#canvas");
        if(!element){
            throw new Error('canvas missing')
        }

        element.evaluate(el=>{
            el.setAttribute('style','width: 700px; cursor: default;')
        })

        await element.screenshot({path})
    }

    DB_avaialble(){
        return fs.existsSync(config.db.backup);
    }

    async restoreMemoryDB(db:RWK_db){
        for(let key of Object.keys(db)){
            await this.db_addKey(key,db[key]);
        }
    }

    async restoreDB(path:string){
        const db:RWK_db = JSON.parse(fs.readFileSync(path,'utf-8'))
        await this.restoreMemoryDB(db)
    }

    async extractDB(){
        const db:RWK_db = {}
        const allkeys = await this.db_getAllKeys();
        for (let i = 0; i < allkeys.length; i++) {
            const key = allkeys[i].toString();
            //console.log(key);
            const obj = await this.db_getKey(key);
            db[key] = obj
        }
        return db
    }

    async backupDB(dbpath:string){
        const db = this.extractDB()

        fs.writeFileSync(dbpath,JSON.stringify(db,null,2))
    }
}
