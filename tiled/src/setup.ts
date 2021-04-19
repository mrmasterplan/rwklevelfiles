// import * as fs from "fs";
const fs = require('fs')

console.log("Running installer...")

const isWin = process.platform === "win32";

const tiled_extension_dir = isWin?
    `C:/Users/${process.env.USERNAME}/AppData/Local/Tiled/extensions/`:
    `~/.config/tiled/extensions/`

fs.copyFileSync(`./build/kitty_bundle.js`,tiled_extension_dir+'kitty_levels.js')