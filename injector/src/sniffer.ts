import {Page} from "puppeteer";
import convert from "xml-js";
import * as csv from 'csv-writer'
import config from "./config";

interface csv_header {
    id:string,
    title:string
}

interface textnode {
    _text: string
}

interface RawLevel {
    [attribute: string]:textnode
}

interface Level {
    [attribute: string]:string
}

export class StatsStore {
    by_author: {
        [author:string]:{[id:string]:Level}
    }
    constructor() {
        this.by_author={}
    }

    async addLevels(rls:RawLevel[]){

        for(let i=0; i<rls.length;i++){
            this.addLevel(rls[i]);
        }

        // done adding levels. Time to update the csv
        console.log("Statistics updated")
        await this.outputFullCSV();
    }

    async outputFullCSV(){
        for(let a of Object.keys(this.by_author)){
            await this.outputAuthorCSV(a,this.by_author[a])
        }
    }

    async outputAuthorCSV(author:string,lvl_dict:{[id:string]:Level}){

        const levels:Level[] = []
        for(let lv of Object.values(lvl_dict)){
            levels.push(lv)
        }

        const header:csv_header[]=[]
        for(let attr of Object.keys(levels[0])){
            header.push({id:attr,title:attr})
        }

        const path = `${config.stats.dir}/${author}_levels.csv`;

        const writer = csv.createObjectCsvWriter({path,header,alwaysQuote:true});
        await writer.writeRecords(levels)

    }

    addLevel(rl:RawLevel){
        const author = this.by_author[rl.AUTHOR._text] || {};
        const level:Level = {}
        for(let attr of Object.keys(rl)) {
            level[attr]=rl[attr]._text
        }
        author[level.ID] = level;

        this.by_author[rl.AUTHOR._text]=author;
    }

    sniff(page:Page){
        page.on("response",async response=>{
            //console.log(response);
            const req = await response.request();
            if(!req._url.match(/go.php/)){
                return
            }
            //console.log(req._url);
            const text = await response.text();
            if(!text.match(/PLAYCOUNT/)){
                return;
            }
            const xml = text.replace("::RMLResponseFollows::","").replace(/\[/g,"<").replace(/\]/g,">")
            const obj = convert.xml2js(`<root>${xml}</root>`,{compact:true})
            // console.log(`<root>${xml}</root>`)
            // console.log(obj)
            // @ts-ignore
            await this.addLevels(obj.root.LEVELS.LEVEL)
            // console.log(obj.root.LEVELS.LEVEL[0])
        })
    }
}
