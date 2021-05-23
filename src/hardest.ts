import {CLI_options} from "./cli";
import {RWKpage} from "./rwkpage";
import * as fs from "fs";

export function register_hardest(option:CLI_options, rwk:RWKpage){
    option['p']={description:'execute play',
        action:async ()=>{
            try {
                const recipe = JSON.parse(fs.readFileSync("hardest.json", "utf8"))
                const k = rwk.page!.keyboard
                for (let item of recipe) {
                    if (item.a.toString().startsWith("p")) {
                        await k.down(item.k)
                        wait(item.p).then(() => k.up(item.k))
                    } else if (item.a.toString().startsWith("d")) {
                        await k.down(item.k)
                    } else if (item.a.toString().startsWith("u")) {
                        await k.up(item.k)
                    } else if (item.a.toString().startsWith("w")) {
                        await wait(item.d)
                    }
                }
            } catch (e){
                console.log(e)
            }
        }
    }
}
async function wait(delay:number){
    return new Promise<void>(res=>setTimeout(res,delay))
}