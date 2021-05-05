import * as db from "./db";
import config from "./config";
import * as user from "./user";
import {DBobj} from "./db";
import {Presenter} from "./user";

var Buffer = require('buffer/').Buffer

export class publishingManger{
    published: { [key:string]:DBobj }
    presenter:Presenter
    constructor() {
        this.published={};
        this.presenter = new Presenter();
        setInterval(()=>{this.fetchAllFromDB()}, 1000);
    }
    async fetchAllFromDB(){
        const keys = await db.getAllKeys()
        const kittys=keys.filter(s=>s.endsWith('.kitty'))
        // console.log(keys)
        // console.log(kittys)
        kittys.forEach(async s=>{
            try{
                const obj = await db.getKey(s)
                const oldobj =this.published[obj.key]
                if(!oldobj || oldobj.timestamp < obj.timestamp){
                    this.published[obj.key] = obj
                    this.presenter.present(obj)
                }
            }catch {}
        })
        this.presenter.cleanKeys(kittys)
        // const items = await Promise.all(kittys.map(k=>db.getKey(k)))
        // user.presentLevels(items.map(i=>i.contents))
    }
}