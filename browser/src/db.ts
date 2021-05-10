import * as idb from "idb";
import config from "./config";
import {IDBPDatabase} from "idb";

var Buffer = require('buffer/').Buffer

export async function getAllKeys():Promise<string[]> {
    const db = await idb.openDB(config.db.name);
    return (await db.getAllKeys(config.db.filestore)).map(i=>i.toString());
}

export interface DBobj {
    timestamp:number
    contents:Buffer
    mode?:number
    key:string
}

export async function getKey(key:string):Promise<DBobj> {

    const db = await idb.openDB(config.db.name);

    const obj= await db.get(config.db.filestore, key);
    obj.timestamp= +obj.timestamp
    if(!obj || !obj.contents) throw new Error("could not read key")
    // if(typeof obj.contents != "undefined"){
    //     obj.content_type = (obj.contents.constructor === Uint8Array)?"Uint8Array":"Int8Array";
    // }
    obj.contents = Buffer.from(obj.contents)
    obj.key = key
    return obj as DBobj;
}


export async function addKitty( file:File) {
    // fist check that kitty seems valid
    const buf = Buffer.from(await file.arrayBuffer())
    const name = extractLevelName(buf)

    const time = new Date()
    console.log(`Restoring kitty level ${name}`)

    const db = await idb.openDB(config.db.name, 21, {
        upgrade(db: IDBPDatabase) {
            const store = db.createObjectStore(config.db.filestore,);
            store.createIndex('timestamp', 'timestamp');
        },
    });

    const obj: any = {}
    obj.contents = new Int8Array(buf.buffer)
    obj.mode = 33206
    obj.timestamp = Date.now()

    const key = config.db.magic_key_base + name + '.kitty'

    try {
        await db.put(config.db.filestore, obj, key);
        console.log('put succeded')
    } catch (e) {
        await db.add(config.db.filestore, obj, key);
        console.log('add succeded')
    }
    console.log((await getAllKeys()).filter(s=>s.endsWith('.kitty')))
}

export function extractLevelName(buf:Buffer){
    let offset = 0
    offset+=4+buf.readUInt32LE(offset)
    const length = buf.readUInt32LE(offset)
    offset+=4
    return buf.slice(offset,offset+length-1).toString('utf-8').trim()
}
