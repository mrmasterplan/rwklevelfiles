
import * as db from './db'

var Buffer = require('buffer/').Buffer



export class Injector {
    main_elem:HTMLElement
    constructor() {
        this.main_elem = document.getElementById("rwkLevelUploads") || document.createElement('div');
        this.main_elem.style.cssText = 'text-decoration: none;border: 5px solid #FFF;border-radius: 25px;background: #00003f;padding-top: 2px;padding-left:20px;padding-right:20px;padding-bottom: 2px;width:425px;font-family: arial;margin: 0;color: white;font-weight:900;';
        this.main_elem.setAttribute("id", "rwkLevelUploads");
        this.main_elem.innerHTML = ''
        const input = document.createElement('input')
        input.setAttribute('type','file')
        input.setAttribute('multiple','')
        input.setAttribute('style','display:none')
        input.setAttribute('accept','.kitty')
        input.addEventListener('change',()=>{
            if(!input.files) return;
            console.log(input.files.length)

            for(let file of input.files){
                db.addKitty(file)
            }
        })
        this.main_elem.appendChild(input)
        const button = document.createElement('button')
        button.innerText='Add level to game'
        button.addEventListener('click',(ev)=>{
            ev.preventDefault()
            input.click()
        },true)
        this.main_elem.appendChild(button)
        document.body.appendChild(this.main_elem);
    }

}
