import * as fse from "fs-extra"
import config from "./config";
import path from "path";
import {Fuzzer} from "./fuzzer";
import inquirer from "inquirer";
import {Tile_library} from "./tile_library";


async function install_all() {
    if(config.fuzzer.cancel_setup){
        console.log("setup skipped in pipeline.")
        return
    }

    console.log("Running setup...")
    console.log("  Building extension package...")
    console.log(`    Copy Tilesets to ${config.install.dist}`)
    fse.copySync(path.join(config.editor.resources, config.editor.tilesets), path.join(config.install.dist, 'tilesets'))

    console.log(`    Check presence of necessary Tiles...`)
    if (Fuzzer.anything_to_fuzz()) {
        console.log("------------------------------------------------")
        if(!config.fuzzer.headless){
            console.log("You need to fuzz the tile graphics. Do that now?")
            const next_action = (await inquirer.prompt([{ type: 'input', name: 'ready', message: "Yes/No:",  }])).ready
            if(! 'yes'.startsWith(next_action.toLowerCase())){
                console.log("Installation aborted.")
                return
            }
        }
        const tilelib = new Tile_library()
        await tilelib.download_tile_library()
        const fuzz = new Fuzzer(config.fuzzer.headless);
        await fuzz.fuzz()
        console.log("------------------------------------------------")
    } else {
        console.log('      ... all tiles present.')
    }

    console.log(`    Copy tile images to ${config.install.dist}`)
    fse.copySync(path.join(config.editor.resources, config.editor.tiles), path.join(config.install.dist, 'tiles'))

    console.log("------------------------------------------------")
    console.log(`The Tiled editor extension has been assembled in the folder ${config.install.dist}.`)
    if(config.fuzzer.headless){
        return
    }

    const next_action = (await inquirer.prompt([{
        type: 'input',
        name: 'ready',
        message: "Install extension to Tiled? yes/No:",
    }])).ready
    if (!'yes'.startsWith(next_action.toLowerCase())) {
        console.log("Installation aborted.")
        return
    }
    console.log(`  Copy extension package to ${config.install.tiled_extension_dir}`)
    fse.copySync(config.install.dist, path.join(config.install.tiled_extension_dir, 'rwk'))
}

install_all()