import * as idb from "idb";
import config from "./config";

var Buffer = require('buffer/').Buffer

export async function getAllKeys():Promise<string[]> {
    const db = await idb.openDB(config.db.name);
    return (await db.getAllKeys(config.db.filestore)).map(i=>i.toString());
}

export interface DBobj {
    timestamp:number
    contents:Buffer
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


// async function db_addKey(key:string, obj_h:DB_file_hex) {
//     // console.log(`Restoring DB key ${key}`)
//
//     const db = await idb.openDB(config.db.name,21,{
//         upgrade(db: IDBPDatabase) {
//             const store = db.createObjectStore(config.db.filestore,);
//             store.createIndex('timestamp','timestamp');
//         },
//     });
//
//     if(typeof obj_h.contents != 'undefined') {
//             const arr: string = obj_h.contents!;
//             const constructor = (obj_h.content_type == "Int8Array") ? Int8Array : Uint8Array;
//             if (!arr){
//                 obj.contents = new constructor();
//             }
//             else{
//                 obj.contents = new constructor(arr.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
//             }
//         }
//         try{
//             // @ts-ignore
//             await db.put(config.db.filestore, obj,key);
//
//         }catch (e){
//             // @ts-ignore
//             await db.add(config.db.filestore, obj,key);
//
//         }
//         // @ts-ignore
//     }, config, key, obj_h);
//

export function extractLevelName(buf:Buffer){
    let offset = 0
    offset+=4+buf.readUInt32LE(offset)
    const length = buf.readUInt32LE(offset)
    offset+=4
    return buf.slice(offset,offset+length-1).toString('utf-8').trim()
}
