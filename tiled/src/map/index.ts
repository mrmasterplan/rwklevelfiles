import {TiledMap} from "tiled-types";
import {t} from "../tiled_object";

var customMapFormat = {
    name: "RwK Level Files",
    extension: "kitty",

    write: function(map:TiledMap, fileName:string) {
        t.log("not supported yet")
    },
}

export function register(){
    t.log(`registering kitty map export format`)
// @ts-ignore
    t.registerMapFormat("kitty", customMapFormat)
}
