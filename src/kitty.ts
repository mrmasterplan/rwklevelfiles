import {db_contributor, RWK_db_handler} from "./db";
import {extractLevelName} from "./level";
import fs from "fs";
import config from "./config";
import {glob} from "glob";
import {custom_level_key_root} from "./fuzzer";


export class kittyContributor implements db_contributor{
    constructor(public db:RWK_db_handler) {
        db.register_contributor(this)
    }

    async load(){
        for(let filename of glob.sync(config.db.levels_in+'/*.kitty')){
            console.log(`injecting ${filename}`)
            const buf = fs.readFileSync(filename)
            const name = extractLevelName(buf)
            this.db.addBuffer(custom_level_key_root + name + ".kitty",buf)
        }

    }

    async dump(){
        for(let key of this.db.keys()) {
            if (key.endsWith('.kitty')) {
                const buf = this.db.getBuf(key)
                if(!buf) continue
                const name = extractLevelName(buf)
                fs.writeFileSync(`${config.db.levels_out}/${name}.kitty`, buf)
            }
        }
    }

}