
import {t} from './tiled_object'

t.log("hello world")

import * as tool from "./tool";
import * as map from "./map"

(()=>{
    map.register()
    tool.register()
})()