import * as fs from "fs";
import * as fse from "fs-extra"
import config from "./config";
import path from "path";
import {Fuzzer} from "./fuzzer";
import inquirer from "inquirer";
import {Tile_library} from "./tile_library";

async function install_all() {
    console.log("Running installer...")
    console.log("  Building extension package...")
    console.log(`    Copy Tilesets to ${config.install.dist}`)
    fse.copySync(path.join(config.editor.resources, config.editor.tilesets), path.join(config.install.dist, 'tilesets'))

    console.log(`    Check presence of necessary Tiles...`)
    if (Fuzzer.anything_to_fuzz()) {
        console.log("------------------------------------------------")
        console.log("You need to fuzz the tile graphics. Do that now?")
        const next_action = (await inquirer.prompt([{ type: 'input', name: 'ready', message: "Yes/No:",  }])).ready
        if(! 'yes'.startsWith(next_action.toLowerCase())){
            console.log("Installation aborted.")
            return
        }
        const tilelib = new Tile_library()
        await tilelib.download_tile_library()
        const fuzz = new Fuzzer();
        await fuzz.fuzz()
        console.log("------------------------------------------------")
    } else {
        console.log('      ... all tiles present.')
    }

    console.log(`    Copy tile images to ${config.install.dist}`)
    fse.copySync(path.join(config.editor.resources, config.editor.tiles), path.join(config.install.dist, 'tiles'))

    console.log(`  Copy extension package to ${config.install.tiled_extension_dir}`)
    fse.copySync(config.install.dist, path.join(config.install.tiled_extension_dir, 'rwk'))
}

install_all()