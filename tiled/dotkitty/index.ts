
import {config} from "../config";
import {fixFlippedCells} from "../kittymenu/fixFlippedCells";
import {bufToTiled, tiledToBuf} from "../tiledkitty"
var Buffer = require('buffer/').Buffer

const dotkitty:ScriptedMapFormat = {
    name:'RwK Level',
    extension:'kitty',
    read: function (fileName:string){
        dbg(`Attempting to open ${fileName}`)
        const bs = new BinaryFile(fileName,BinaryFile.ReadOnly);
        const buf = Buffer.from(bs.readAll())
        bs.close()
        tiled.log('Binary file read to memory.')

        const map = bufToTiled(buf)

        tiled.trigger('FitInView')
        return map
    },

    write: function(map:TileMap, fileName:string) {
        const name_match = fileName.match(/[^\/]*\.kitty$/)
        const name=name_match?name_match[0].slice(0,-".kitty".length):null

        if(!name) throw new Error("Please use a name ending in .kitty.")
        map.setProperty('name',name)

        fixFlippedCells(map)
        tiled.log(`Now exporting level ${name}`)
        const buf = tiledToBuf(map)


        tiled.log(`Now writing file ${fileName}`)
        const bs = new BinaryFile(fileName,BinaryFile.WriteOnly);
        bs.resize(buf.length)
        bs.write(buf.buffer)
        bs.commit()
        //bs.close()

        return ''
    }
}

function dbg(s:string){
    if(config.debug) tiled.log(s)
}


export function register(){
    tiled.log(`registering kitty map export format`)
    tiled.registerMapFormat("kitty", dotkitty)
}
