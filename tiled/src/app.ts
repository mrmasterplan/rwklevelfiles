
import * as t from './tiled_object'
import './tool'

t.log("hello world")

import {TiledMap} from 'tiled-types'

var customMapFormat = {
    name: "RwK Level Files",
    extension: "kitty",

    write: function(map:TiledMap, fileName:string) {
        t.log("not supported yet")
    },
}

// @ts-ignore
tiled.registerMapFormat("kitty", customMapFormat)