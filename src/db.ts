import {extractLevelName} from "./level";
import {custom_level_key_root, level_base_obj, minimal_DB} from "./fuzzer";
import fs from "fs";
import config from "./config";
import path from "path";

export interface db_contributor {
    load:()=>Promise<void>
    dump:()=>Promise<void>
}

export interface DB_file_hex {
    timestamp: number,
    mode: number,
    contents?: string,
    content_type?: string,
}

export interface RWK_db {
    [key: string]: DB_file_hex
}

export class RWK_db_handler {
    db: RWK_db
    contributors: db_contributor[]

    constructor() {
        this.db = {}
        this.contributors=[]
        this.reset()
    }

    reset(){
        this.update(minimal_DB)
    }

    keys(){
        return Object.keys(this.db)
    }

    getBuf(key:string){
        const obj = this.db[key]
        if(!obj) return undefined;
        const conts = obj.contents;
        if(!conts) return undefined;
        return Buffer.from(conts,"hex");
    }

    addBuffer(key:string,buf:Buffer){
        const dirs = path.dirname(key).split("/")
        for(let index =0; index<dirs.length; index++){
            const dir = dirs.slice(0,index).join("/")
            if(!this.db.dir) this.addDir(dir)
        }
        this.db[key]={
            timestamp:Date.now(),
            mode:33206,
            content_type:"Int8Array",
            contents: buf.toString('hex')
        }
    }

    addDir(key:string){
        // some dir-names are forbidden
        if(!key) return
        if(! key.startsWith('/')) key = "/"+key
        if(key == "/RAPTISOFT_SANDBOX") return
        this.db[key]={"timestamp":Date.now(),"mode":16895}
    }

    addCustomKitty(buf: Buffer) {
        const name = extractLevelName(buf)
        this.addBuffer(custom_level_key_root + name + ".kitty",buf)
        // this.db[custom_level_key_root + name + ".kitty"] = {
        //     ...level_base_obj,
        //     contents: buf.toString('hex')
        // }
    }

    addCustomSav(key: string, buf: Buffer) {
        this.addBuffer(`/RAPTISOFT_SANDBOX/RWK/${key}`,buf)
        // const name =
        //     this.db[`/RAPTISOFT_SANDBOX/RWK/${key}`] = {
        //         ...level_base_obj,
        //         contents: buf.toString('hex')
        //     }
    }

    async load_file(filename:string){
        this.reset()
        if(fs.existsSync(filename))
            this.update(JSON.parse(fs.readFileSync(filename,'utf-8')))
        await this.call_contributors_load()
    }

    update(odb:RWK_db){
        for (let key of Object.keys(odb)) {
            this.db[key] = odb[key]
        }
    }

    async dump_file(filename:string){
        await this.call_contributors_dump()
        fs.writeFileSync(config.db.backup,JSON.stringify(this.db,null,2))
    }


    register_contributor(contributor:db_contributor){
        this.contributors.push(contributor)
    }

    async call_contributors_load(){
        await Promise.all(this.contributors.map(con=>con.load()))
    }
    async call_contributors_dump(){
        await Promise.all(this.contributors.map(con=>con.dump()))
    }
}