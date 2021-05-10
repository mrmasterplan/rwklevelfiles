import * as db from "./db";
import config from "./config";
import * as user from "./user";
import {DBobj} from "./db";
import {Presenter} from "./user";
import {FullPage} from "./page";

var Buffer = require('buffer/').Buffer

export class publishingManger{
    published: { [key:string]:DBobj }
    presenter:Presenter

    constructor(public page:FullPage) {
        this.published={};
        this.presenter = new Presenter(async ()=>{await this.fetchAllFromDB()},page);
        // setInterval(()=>{this.fetchAllFromDB()}, 1000);
    }

    async fetchAllFromDB(){
        const keys = await db.getAllKeys()
        const kittys=keys.filter(s=>s.endsWith('.kitty'))
        this.presenter.cleanKeys(kittys)
        await Promise.all(kittys.map(async s=>{
            try{
                const obj = await db.getKey(s)
                const oldobj =this.published[obj.key]
                if(!oldobj || oldobj.timestamp < obj.timestamp){
                    this.published[obj.key] = obj
                    await this.presenter.present(obj)
                }
            }catch {}
        }))
        // const items = await Promise.all(kittys.map(k=>db.getKey(k)))
        // user.presentLevels(items.map(i=>i.contents))
    }
}