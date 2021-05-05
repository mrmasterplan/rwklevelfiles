import * as db from "./db";
import {DBobj} from "./db";

var Buffer = require('buffer/').Buffer



export class Presenter {
    main_elem:HTMLElement
    presented:{[key:string]: HTMLElement}
    anything_changed:boolean
    constructor() {
        this.presented={}
        this.anything_changed = true
        this.main_elem = document.getElementById("rwkLevelDownloads") || document.createElement('div');
        this.main_elem.style.cssText = 'text-decoration: none;border: 5px solid #FFF;border-radius: 25px;background: #00003f;padding-top: 2px;padding-left:20px;padding-right:20px;padding-bottom: 2px;width:425px;font-family: arial;margin: 0;color: white;font-weight:900;';
        this.main_elem.setAttribute("id", "rwkLevelDownloads");
        document.body.appendChild(this.main_elem);
        setInterval(()=>{if (this.anything_changed) this.refreshGraphics()},1000)
    }

    async present(obj:DBobj){
        if(this.presented[obj.key]) delete this.presented[obj.key]
        this.presented[obj.key] = document.createElement('p')
        const name = db.extractLevelName(obj.contents)
        this.presented[obj.key].innerHTML=`&nbsp;&nbsp;<a download="${name}.kitty" href="data:application/octet-stream;base64,${obj.contents.toString('base64')}">${name}</a>`
        this.anything_changed = true
    }

    async cleanKeys(all:string[]){
        const all_obj:{[key:string]:true}={}
        for(let s of all) all_obj[s]=true
        Object.keys(this.presented).forEach(k=>{
            if(!all_obj[k]){
                delete this.presented[k]
                this.anything_changed = true
            }})
    }

    async refreshGraphics(){
        this.anything_changed = false
        this.main_elem.innerHTML = "<p>Levels to download:</p>"
        Object.values(this.presented).forEach(el=>{this.main_elem.appendChild(el)})
    }

}
//
// export async function presentLevels(lvls:Buffer[]){
//     // elem.innerHTML = kittys.map(i=>`<p>${i}</p>`).join('')
//     elem.innerHTML = "<p>Levels to download:</p>"
//     for(let lvl of lvls){
//         const name = db.extractLevelName(lvl)
//         elem.innerHTML+=`<p>&nbsp;&nbsp;<a download="${name}.kitty" href="data:application/octet-stream;base64,${lvl.toString('base64')}">${name}</a></p>`
//     }
//
// }
//
