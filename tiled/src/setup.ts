// import * as fs from "fs";
// import * as fse from "fs-extra"
const fse = require('fs-extra')

console.log("Running installer...")

const isWin = process.platform === "win32";

const tiled_extension_dir = isWin?
    `C:/Users/${process.env.USERNAME}/AppData/Local/Tiled/extensions/`:
    `~/.config/tiled/extensions/`

const fs = require('fs');

fs.readdir('./build/', (err:any, files:string[]) => {
    files.forEach((file) => {
        fse.copy('./build/'+file,tiled_extension_dir+file)
        console.log(file);
    });
});
// fse.removeSync(tiled_extension_dir+'app.js')
