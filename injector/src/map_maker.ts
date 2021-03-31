import {Canvas, createCanvas, Image} from "canvas";
import config from "./config";
import fs from "fs";
import {Level_analysis} from "./level_analysis";
import * as buffer from "buffer";
import {Tile_library} from "./tile_library";
import {glob} from "glob";

export class MapMaker {
    tiles:Tile_library
    constructor() {
        this.tiles = new Tile_library()

    }
    async make_all(){
        for(let level of glob.sync(`${config.levels.bin_dir}/*.kitty`)){
            const buf = fs.readFileSync(level)
            console.log(`Now making map of ${level}`)
            await this.make_map(buf)
            console.log(`Done making map of ${level}`)
        }
    }
    async make_map(buf:Buffer) {
        const lvlana = new Level_analysis()
        const name = lvlana.getName(buf)
        const grid = lvlana.getGrid(buf)

        // create the map of the level
        let canvas: Canvas;
        try {
            canvas = createCanvas(grid.cols * config.tile_library.tile_width, grid.rows * config.tile_library.tile_height)
        } catch (e) {
            console.log(`unable to create canvas of size ${grid.cols * config.tile_library.tile_width}, ${grid.rows * config.tile_library.tile_height}`)
            return
        }

        // cell block bytes

        const ccont = canvas.getContext('2d')
        for (let j = 0; j < grid.rows; j++) {
            for (let i = 0; i < grid.cols; i++) {

                const full_cell_data = grid.getCellAsNumber(i, j)


                if (!this.tiles.tile_of(full_cell_data)) {
                    console.log(`no tile data for cell(${i},${j}), value ${full_cell_data}. Did you forget to fuzz the tiles?`)
                } else {
                    const img = new Image()
                    img.onload = () => ccont.drawImage(img, i * config.tile_library.tile_width, j * config.tile_library.tile_height)
                    img.onerror = err => {
                        throw err
                    }
                    img.src = this.tiles.tile_of(full_cell_data)
                }

            }

        }
        fs.writeFileSync(`${config.levels.bin_dir}/${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.map.png`, canvas.toBuffer('image/png'))
    }
}