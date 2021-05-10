import * as db from "./db";
import {DBobj} from "./db";
import {FullPage} from "./page";

var Buffer = require('buffer/').Buffer



export class Presenter {
    main_elem:HTMLElement
    button:HTMLElement
    presented:{[key:string]: HTMLElement}
    anything_changed:boolean
    constructor(refresh_action:()=>Promise<void>,public page:FullPage) {
        this.presented={}
        this.anything_changed = true
        this.main_elem = page.document.getElementById("rwkLevelDownloads") || page.document.createElement('div');
        this.main_elem.style.cssText = 'text-decoration: none;border: 5px solid #FFF;border-radius: 25px;background: #00003f;padding-top: 2px;padding-left:20px;padding-right:20px;padding-bottom: 2px;width:425px;font-family: arial;margin: 0;color: white;font-weight:900;';
        this.main_elem.setAttribute("id", "rwkLevelDownloads");
        this.button = page.document.createElement('button')
        this.button.innerText='Refresh'
        this.button.addEventListener('click',async (ev)=>{
            ev.preventDefault()
            await refresh_action()
            this.refreshGraphics()
        },true)
        this.main_elem.appendChild(this.button)

        page.document.body.appendChild(this.main_elem);

        refresh_action()
        this.refreshGraphics()
        // setInterval(()=>{if (this.anything_changed) this.refreshGraphics()},1000)
    }

    async present(obj:DBobj){
        if(this.presented[obj.key]) delete this.presented[obj.key]
        this.presented[obj.key] = this.page.document.createElement('p')
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
        this.main_elem.appendChild(this.button)
        Object.values(this.presented).forEach(el=>{this.main_elem.appendChild(el)})
    }

}
