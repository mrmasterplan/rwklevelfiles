
import {config} from "../config";
import {bufToTiled} from "../tiledkitty"
var Buffer = require('buffer/').Buffer

const dotkittyb64:ScriptedMapFormat = {
    name:'RwK Level in bas64',
    extension:'kitty.b64',
    read: function (fileName:string){
        dbg(`Attempting to open ${fileName}`)
        const tf = new TextFile(fileName,TextFile.ReadOnly);
        const buf = Buffer.from(Buffer.from(tf.readAll(), 'base64'))
        tf.close()
        tiled.log('Buffer file read to memory.')

        const map = bufToTiled(buf)

        tiled.trigger('FitInView')
        return map
    },

}

function dbg(s:string){
    if(config.debug) tiled.log(s)
}


export function register(){
    tiled.log(`registering kittyb64 map import format`)
    tiled.registerMapFormat("kitty.b64", dotkittyb64)
}

