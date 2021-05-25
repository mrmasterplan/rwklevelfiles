import {CLI_options} from "./cli";
import {db_contributor, RWK_db_handler} from "./db";
import {glob} from "glob";
import fs from "fs";
import {extractLevelName} from "./level";
import {custom_level_key_root} from "./fuzzer";
import path from "path";
import config from "./config";
import {delimitedBuffer, delimitedStringBuffer} from "./bin";

const sav_injection_base = [
    {
        resume:"[NAME]test-blue[/NAME][AUTHOR]testuser[/AUTHOR][AUTHORLEVEL]2[/AUTHORLEVEL][AVATAR][/AVATAR][COUNTRY]PL[/COUNTRY][ID]61694[/ID][CLIENTVERSION]10.00[/CLIENTVERSION][RATING][/RATING][DATE]2021-04-14 20:31:15[/DATE][TAGS]9223372036854784003[/TAGS][PLAYCOUNT][/PLAYCOUNT][WINCOUNT][/WINCOUNT][STARS][/STARS][MISCFLAG]-50[/MISCFLAG][COMMENTS][/COMMENTS]",
        sav:"0000000000000000020000003000000000000000280000002f5241505449534f46545f53414e44424f582f52574b2f646f776e6c6f616465642e6b69747479000000000000000000000000000100000006000000576f726c6400010000000109000000a80000000800000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009247000600000000000000000000000000000000000000000000000000000000135d00060000000000000000000000003000000001470006815d0006815d0006014e0006815d0006815d0006815d00060148000663636363636363636363636363636363636363636363636301000000040000000000000000000000080000000000704200006c42000000000800000000005c430000604200000000530000000100000000010000000000000000000070420000704200000000000000006666663f00000000000000000100000000000000000000000000000000000000003f0000003f010000000001000000000100000000000000004f00000000000070420000704201000000010000000001000000000000000000000000000000000000000000000000000000f500000000000000000000000000000000000000000000000000000000000000000000000000000000020000002e000000010000000000704200006c42010000000001000000010000000000e0c0000050c100006041000008420000000000000000007d000000000000000000803f0000000000000000000000000000000000000000000000ef0100000000803f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000803f00000000000000000000000000000000020000002e0000000300000000005c430000604201000000000000000000000000000020c1000040c10000a041000010420000000000000000000f00000021ffbf3f000000000000000000000000000000080000000100000004000000020000002e000000040000000000a0410000704201000000000000000000000000000000000000000000000000000000000000000000000000000d0000000900000092ad8d43000000803f0000000004000000000000000000000000000000"
    }
]


export class SavContributor implements db_contributor {
    constructor(public db:RWK_db_handler) {
        db.register_contributor(this)
    }

    async load(){
        const savr = new SavAssembler()
        for(let filename of glob.sync(config.db.levels_in+'/*.sav')){
            console.log(`injecting ${filename}`)
            this.db.addBuffer(`/RAPTISOFT_SANDBOX/RWK/${path.basename(filename)}`,fs.readFileSync(filename))
        }
        this.db.addBuffer(`/RAPTISOFT_SANDBOX/RWK/recent.levels`,savr.getRecentLevels())


    }

    async dump(){
        for(let key of this.db.keys()){
            if( key.endsWith('.sav') && config.db.extract_sav){
                const buf = this.db.getBuf(key)
                // const buf = Buffer.from(db[key].contents!,'hex')
                console.log(`treating sav: ${key}`)
                // fs.writeFileSync(`${config.db.levels_out}/${path.basename(key)}.kitty`,sav_to_lvl(buf))
                fs.writeFileSync(`${config.db.levels_out}/${path.basename(key)}`,buf!)
                //delete db[key]
            }

            if( key.endsWith('recent.levels') && config.db.extract_sav){
                const buf = this.db.getBuf(key)
                // const buf = Buffer.from(db[key].contents!,'hex')
                console.log(`treating sav: ${key}`)
                // fs.writeFileSync(`${config.db.levels_out}/${path.basename(key)}.kitty`,sav_to_lvl(buf))
                fs.writeFileSync(`${config.db.levels_out}/${path.basename(key)}`,buf!)
                //delete db[key]
            }

        }
    }

}

class SavAssembler {
    constructor() {
    }

    getRecentLevels(){
        return Buffer.concat([
            delimitedStringBuffer("[NAME]who me[/NAME][AUTHOR]unpublished[/AUTHOR][ID]61695[/ID]"),
            delimitedStringBuffer("[NAME]hi there[/NAME][AUTHOR]unpublished[/AUTHOR][ID]61694[/ID]"),
        ])
    }
}


export function register_sav_actions(options:CLI_options){
    options['sl']={
        description:"sav to level",
        action: async ()=>{

        }
    }
}