import {publishingManger} from "./publisher";

export class FullPage {
    rwk_if:HTMLIFrameElement
    constructor() {
        this.rwk_if = document.createElement('iframe')
        this.rwk_if.height="100%"
        this.rwk_if.width="100%"
        this.rwk_if.setAttribute('frameborder','0')

        document.body.appendChild(this.rwk_if)

        // full page iframe: https://stackoverflow.com/questions/17710039/full-page-iframe
        const css = 'body, html{margin: 0; padding: 0; height: 100%; overflow: hidden;}\n' +
            '#content{position:absolute; left: 0; right: 0; bottom: 0; top: 0px; }'
        const head = document.head || document.getElementsByTagName('head')[0]
        const style = document.createElement('style');

        head.appendChild(style);

        style.setAttribute('type','text/css')
        style.appendChild(document.createTextNode(css));


        this.full_rwk()

    }


    async full_rwk(){
        this.rwk_if.setAttribute('src','http://robotwantskitty.com/web/')
        this.document.addEventListener('load',()=>{
             new publishingManger(this)
        })
    }

    async minimal(){
        this.rwk_if.setAttribute('src','')
        this.rwk_if.setAttribute('style','width:100%;height:100vh')
        this.rwk_if.setAttribute('sandbox','')
        this.rwk_if.setAttribute('src','http://robotwantskitty.com/web/')
    }

    get document() {
        return this.rwk_if.contentWindow!.document
    }

}