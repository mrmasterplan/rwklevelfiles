import {getMapLimits} from "../tiledkitty";
import {parsed_base_tileset, parsed_tileset} from "../kittypaint";
import {config} from "../config";

function flipGridHorizontally(grid:string){
    if(grid.length!=8) throw new Error(`attempting to flip grid of invalid size ${grid.length}`)

    return [grid.charAt(2),grid.charAt(1),grid.charAt(0),grid.charAt(4),grid.charAt(3),grid.charAt(7),grid.charAt(6),grid.charAt(5)].join("")
}

function flipGridVertically(grid:string){
    if(grid.length!=8) throw new Error(`attempting to flip grid of invalid size ${grid.length}`)
    return [grid.charAt(5),grid.charAt(6),grid.charAt(7),grid.charAt(3),grid.charAt(4),grid.charAt(0),grid.charAt(1),grid.charAt(2)].join("")
}

function flipGridAntiDiagonally(grid:string){
    if(grid.length!=8) throw new Error(`attempting to flip grid of invalid size ${grid.length}`)
    return [grid.charAt(7),grid.charAt(4),grid.charAt(2),grid.charAt(6),grid.charAt(1),grid.charAt(5),grid.charAt(3),grid.charAt(0)].join("")
    // return [grid.charAt(0),grid.charAt(3),grid.charAt(5),grid.charAt(1),grid.charAt(6),grid.charAt(2),grid.charAt(4),grid.charAt(7)].join("")
}


export function fixFlippedCells(map:TileMap) {
    const limits = getMapLimits(map)

    const actions:(()=>void)[]=[]

    for (let layer_i = 0; layer_i < map.layerCount; layer_i++) {
        const layer = map.layerAt(layer_i)
        if (layer.isTileLayer) {
            const tile_layer = layer as TileLayer
            for (let i = limits.minx; i < limits.maxx; i++) {
                const lvl_i = i - limits.minx
                for (let j = limits.miny; j < limits.maxy; j++) {
                    const lvl_j = j - limits.miny
                    const flags = tile_layer.flagsAt(i, j)
                    if (!flags) continue;

                    let tile = tile_layer.tileAt(i, j)
                    if (!tile) continue
                    const props = tile.resolvedProperties()

                    if (props.paint) {
                        if (!props.paint_grid) {
                            tiled.log(`Error in layer ${tile_layer.name} at (${i},${j}) tile has paint but not paint_grid property.`)
                            continue
                        }
                        let grid: string = props.paint_grid.toString()

                        if(flags & Tile.FlippedHorizontally){
                            grid = flipGridHorizontally(grid)
                        }
                        if(flags & Tile.FlippedVertically){
                            grid = flipGridVertically(grid)
                        }
                        if(flags & Tile.FlippedAntiDiagonally){
                            grid = flipGridAntiDiagonally(grid)
                        }
                        if(grid!=props.paint_grid){
                            const newtile = parsed_tileset(tile.tileset)[grid]
                            if(!newtile) throw new Error(`invalid paint grid ${grid}`)

                            tile = newtile
                        }
                        actions.push(()=>{
                            const edit = tile_layer.edit()
                            edit.setTile(i,j,tile!,0)
                            edit.apply()
                        })
                        continue
                    }
                    if(props.base || props.map){
                        const index:number = (props.base || props.map) as number
                        const indexed_tileset = parsed_base_tileset(tile.tileset)

                        let tile_treated = false
                        if(flags & Tile.FlippedVertically) {
                            for (let pair of config.base_tiles.vertical_pairs) {
                                if (pair.includes(index)) {
                                    const other_index = pair[pair.indexOf(index) ? 0 : 1]
                                    const other_tile = indexed_tileset[other_index]
                                    actions.push(() => {
                                        const edit = tile_layer.edit()
                                        edit.setTile(i, j, other_tile, 0)
                                        edit.apply()
                                    })
                                    tile_treated=true
                                    break
                                }
                            }
                        }
                        if(!tile_treated && (flags & Tile.FlippedHorizontally)) {
                            for (let pair of config.base_tiles.horizontal_pairs) {
                                if (pair.includes(index)) {
                                    const other_index = pair[pair.indexOf(index) ? 0 : 1]
                                    const other_tile = indexed_tileset[other_index]
                                    actions.push(() => {
                                        const edit = tile_layer.edit()
                                        edit.setTile(i, j, other_tile, 0)
                                        edit.apply()
                                    })
                                    tile_treated=true
                                    break
                                }
                            }
                        }
                        // != equates to XOR. To get parity we XOR all three flippings.
                        if(!tile_treated && ((!!(flags & Tile.FlippedHorizontally) != !!(flags & Tile.FlippedVertically)) != !!(flags & Tile.FlippedAntiDiagonally))){
                            for (let pair of config.base_tiles.parity_pairs) {
                                if (pair.includes(index)) {
                                    const other_index = pair[pair.indexOf(index) ? 0 : 1]
                                    const other_tile = indexed_tileset[other_index]
                                    actions.push(() => {
                                        const edit = tile_layer.edit()
                                        edit.setTile(i, j, other_tile, 0)
                                        edit.apply()
                                    })
                                    tile_treated=true
                                    break
                                }
                            }
                        }
                        if(!tile_treated) {
                            actions.push(() => {
                                const edit = tile_layer.edit()
                                edit.setTile(i, j, tile!, 0)
                                edit.apply()
                            })
                        }
                    }
                }
            }
        }
    }
    map.macro("fix flipped tiles",()=>{
        for(let a of actions) a()
    })
}