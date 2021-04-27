import {t} from "../tiled_object";
import {TileMap} from "../tiled_object/TileMap";

import {Level} from '../../src/level'

var customMapFormat = {
    name: "RwK Level Files",
    extension: "kitty",

    write: function(map:TileMap, fileName:string) {
        t.log("not supported yet")
    },
}

export function register(){
    t.log(`registering kitty map export format`)
// @ts-ignore
    t.registerMapFormat("kitty", customMapFormat)
}
