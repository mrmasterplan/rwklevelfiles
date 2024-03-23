
import {config} from "../config";
import {fixFlippedCells} from "../kittymenu/fixFlippedCells";
import {bufToTiled, tiledToBuf} from "../tiledkitty"
var Buffer = require('buffer/').Buffer

const dotkittyjs:ScriptedMapFormat = {
    name:'RwK Level injection snippet',
    extension:'kitty.js',

    write: function(map:TileMap, fileName:string) {

        fixFlippedCells(map)

        const injectionFileName = map.property('name')

        tiled.log(`Now exporting level ${injectionFileName}`)
        const buf = tiledToBuf(map)

        const injectionB64buffer = buf.toString('base64')

        const script = `
var dbRequest = indexedDB.open("/RAPTISOFT_SANDBOX", 21);
dbRequest.onsuccess = function(event) {
  var db = event.target.result;

  // Perform the add operation with the key
  var request = db.transaction(["FILE_DATA"], "readwrite").objectStore("FILE_DATA").put(
      {
        timestamp:new Date(),
        mode: 33206,
        contents:base64ToUint8Array("${injectionB64buffer}")
      },
      "/RAPTISOFT_SANDBOX/RWK/EXTRALEVELS64/${injectionFileName}.kitty");

  request.onsuccess = function() {
    console.log("Level saved successfully! Reloading in 2 seconds.");
    setTimeout(function() {location.reload();}, 2000);
  };

  request.onerror = function(event) {
    console.error("Error storing Uint8Array data: ", event.target.error);
  };
};

dbRequest.onerror = function(event) {
  console.error("Error opening database: ", event.target.error);
};

function base64ToUint8Array(base64) {
  return new Uint8Array(Array.from(atob(base64), c => c.charCodeAt(0)));
}
        `

        tiled.log(`Now writing file ${fileName}`)
        const fs = new TextFile(fileName,TextFile.WriteOnly);
        fs.write(script)
        fs.commit()
        //bs.close()

        return ''
    }
}

function dbg(s:string){
    if(config.debug) tiled.log(s)
}


export function register(){
    tiled.log(`registering kittyjs map export format`)
    tiled.registerMapFormat("kitty.js", dotkittyjs)
}

