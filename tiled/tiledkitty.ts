import {Level, normalizedTileValue} from "./level";

import {config} from "./config";
import {allPaintTilesets, baseTileset, mapTileset, robotTileset} from "./kittymenu/kittyTileSets";
import {fixFlippedCells} from "./kittymenu/fixFlippedCells";


var Buffer = require('buffer/').Buffer


export function bufToTiled (buf:Buffer) {
    const map = new TileMap()
    map.setTileSize(40,40)
    map.infinite = true

    dbg('Read operation started')
    dbg('Parse all tilesets')

    for (let set of [baseTileset(),mapTileset(),robotTileset()].concat(allPaintTilesets())) {
        map.addTileset(set)
        tiled.close(set)
    }

    const paint_registry:{[key:number]:Tile} = {}
    const base_registry:{[key:number]:Tile} = {}
    const map_registry:{[key:number]:Tile} = {}
    const robot_registry:{robot?:Tile,kitty?:Tile} = {}
    for (let set of map.tilesets) {
        for (let tile of set.tiles) {
            const props = tile.properties()
            if(props.paint){
                paint_registry[normalizedTileValue(+props.paint)] = tile
            }else if(props.base){
                base_registry[normalizedTileValue(+props.base)] = tile
            }else if(props.map){
                map_registry[normalizedTileValue(+props.map)] = tile
            }else if(props.kind){
                if(props.kind === 'robot') robot_registry.robot = tile
                else if(props.kind ==='kitty')robot_registry.kitty = tile
                else throw new Error(`tile in robot tileset has invalid kind property ${props.kind}`)
            }else{
                throw new Error(`Tile of unknown type in tileset ${set.name}`)
            }
        }
    }

    if(!robot_registry.robot || !robot_registry.kitty) throw new Error(`robot and/or kitty tiles not found`)


    const lvl = Level.from(buf,dbg)
    tiled.log(`Level parsed. Name: ${lvl.name}`)

    map.setProperty('name',lvl.name)
    map.setProperty('tags',lvl.tags.get_tags())
    map.setProperty('conveyor_speed',lvl.footer.belt_speed)
    map.setProperty('music_red',lvl.footer.music[0])
    map.setProperty('music_green',lvl.footer.music[1])
    map.setProperty('music_blue',lvl.footer.music[2])

    map.setSize(lvl.grid.size_x,lvl.grid.size_y)

    const mapLayer = new TileLayer('map')
    map.addLayer(mapLayer)
    const baseLayer = new TileLayer('base')
    map.addLayer(baseLayer)
    const paintLayer = new TileLayer('paint')
    map.addLayer(paintLayer)
    const itemsLayer = new TileLayer('items')
    map.addLayer(itemsLayer)

    const base_edit = baseLayer.edit()
    const map_edit = mapLayer.edit()
    const paint_edit = paintLayer.edit()
    const items_edit = itemsLayer.edit()
    for(let j=0;j<lvl.grid.size_y;j++) {
        for (let i = 0; i < lvl.grid.size_x; i++) {
            const cell = lvl.grid.getCellObj(i,j)
            // stop! we need to open the tilesets, then parse them

            paint_edit.setTile(i,j,paint_registry[cell.paint])
            map_edit.setTile(i,j,map_registry[lvl.grid.getMapCell(i,j)])
            if(config.base_tiles.elevated.includes(cell.base)){
                items_edit.setTile(i,j,base_registry[cell.base])
            }else {
                base_edit.setTile(i,j,base_registry[cell.base])
            }
        }
    }

    base_edit.apply()
    items_edit.apply()
    paint_edit.apply()
    map_edit.apply()

    // cells and paint is done.

    // now process robot and kitty
    const robot_obj = new MapObject()
    robot_obj.tile = robot_registry.robot
    robot_obj.pos.x = lvl.robot.x - map.tileWidth/2
    robot_obj.pos.y = lvl.robot.y + map.tileHeight/2
    robot_obj.width = robot_registry.robot.width
    robot_obj.height = robot_registry.robot.height

    const kitty_obj = new MapObject()
    kitty_obj.tile = robot_registry.kitty
    kitty_obj.pos.x = lvl.kitty.x - map.tileWidth/2
    kitty_obj.pos.y = lvl.kitty.y + map.tileHeight/2
    kitty_obj.width = robot_registry.kitty.width
    kitty_obj.height = robot_registry.kitty.height

    const robot_layer = new ObjectGroup('robot')
    robot_layer.addObject(robot_obj)
    robot_layer.addObject(kitty_obj)
    map.addLayer(robot_layer)

    // and now process the callouts

    const callout_layer = new ObjectGroup('callouts')
    for(let callout of lvl.callouts.callouts){
        const callout_obj = new MapObject()
        callout_obj.shape = MapObject.Text
        callout_obj.pos.x = (callout.x+0.2)*map.tileWidth
        callout_obj.pos.y = (callout.y+0.2)*map.tileHeight
        callout_obj.text = callout.text
        callout_obj.height = map.tileHeight
        callout_obj.width = callout.text.length*(callout_obj.font.pixelSize/2) // crude way to estimate required width
        callout_obj.wordWrap=true

        callout_layer.addObject(callout_obj)
    }
    map.addLayer(callout_layer)

    return map
}

export function tiledToBuf (map:TileMap){

    const name= map.property('name')?.toString()

    if(!name) throw new Error("Could not determine level name. Please use map property 'name'")

    fixFlippedCells(map)
    tiled.log(`Now exporting level ${name}`)
    const lvl = new Level({name})

    if(map.property('name') && map.property('name')!==lvl.name) tiled.alert(`Level name property ignored. Level name will be "${lvl.name}" as filename.`)

    lvl.footer.belt_speed = parseFloat(map.property("conveyor_speed")?.toString()||"0.6")
    lvl.footer.music[0] = map.property('music_red')?.toString() ||''
    lvl.footer.music[1] = map.property('music_green')?.toString() ||''
    lvl.footer.music[2] = map.property('music_blue')?.toString() ||''
    map.property('tags')?.toString().split(',').map(t=>{if(t)lvl.tags.set_tag(t.trim().toLowerCase())})

    // determine actual map size. (a bit complicated for infinite maps)
    const limits = getMapLimits(map)

    tiled.log(`Map size ${limits.maxx-limits.minx},${limits.maxy-limits.miny}`)
    lvl.grid.setSize(limits.maxx-limits.minx,limits.maxy-limits.miny)

    // tiled.alert("now starting grid conversion")
    for(let layer_i = 0; layer_i<map.layerCount; layer_i++){
        const layer = map.layerAt(layer_i)
        if(layer.isGroupLayer) throw new Error("Goup Layers currently not supported")
        if(layer.isImageLayer) throw new Error( "Image Layers currently not supported")
        if(layer.isTileLayer){
            const tile_layer = layer as TileLayer
            for(let i=limits.minx;i<limits.maxx;i++) {
                const lvl_i=i-limits.minx
                for (let j = limits.miny; j < limits.maxy; j++) {
                    const lvl_j = j - limits.miny
                    const tile = tile_layer.tileAt(i,j)
                    if(!tile) continue
                    const props = tile.properties()
                    if(props.kind){
                        //// line commeted out and replaced with manual code until this is fixed: https://github.com/mapeditor/tiled/issues/3054
                        // const pos = map.tileToPixel(lvl_i,lvl_j) // here we intentionally convert the lvl coordinates.
                        const pos:point = {x:map.tileWidth*lvl_i,y:map.tileHeight*lvl_j}
                        if(props.kind === 'robot'){
                            lvl.robot.x = pos.x + map.tileWidth/2
                            lvl.robot.y = pos.y + map.tileHeight/2
                        }else if(props.kind === 'kitty'){
                            lvl.kitty.x = pos.x + map.tileWidth/2
                            lvl.kitty.y = pos.y + map.tileHeight/2
                        }else return `Tile at ${i},${j} in layer ${layer.name} has unknown kind ${props.kind}`
                    }else if(props.base){
                        const base = parseInt(props.base.toString())
                        lvl.grid.setCellBase(lvl_i,lvl_j,base)
                    }else if(props.paint){
                        const paint = parseInt(props.paint.toString())
                        lvl.grid.setCellPaint(lvl_i,lvl_j,paint)
                    }else if(props.map){
                        const map = parseInt(props.map.toString())
                        lvl.grid.setMapCell(lvl_i,lvl_j,map)
                    }else {
                        throw new Error(`Unsupported tile at pos (${i},${j}) in layer ${layer.name}`)
                    }
                }
            }
        }
        else if(layer.isObjectLayer){
            const obj_layer = layer as ObjectGroup
            for (let mobj of obj_layer.objects){
                if(mobj.tile){
                    const props = mobj.tile.properties()
                    if(!props.kind) throw new Error(`Unsuppored tile in object layer. Only robot and kitty are OK.`)
                    const pos = {
                        x:mobj.x-limits.minx*map.tileWidth,
                        y:mobj.y-limits.miny*map.tileHeight,
                    }
                    if(props.kind === 'robot'){
                        lvl.robot.x = pos.x + map.tileWidth/2
                        lvl.robot.y = pos.y - map.tileHeight/2
                    }else if(props.kind === 'kitty'){
                        lvl.kitty.x = pos.x + map.tileWidth/2
                        lvl.kitty.y = pos.y - map.tileHeight/2
                    }else return `Tile at ${mobj.x},${mobj.y} in layer ${layer.name} has unknown kind ${props.kind}`
                }
                else if(mobj.text){
                    // tiled.log(`mobj ${mobj.x},${mobj.y}`)
                    const call_x = Math.round(mobj.x/map.tileWidth)-limits.minx
                    const call_y = Math.round(mobj.y/map.tileHeight)-limits.miny
                    // tiled.log(`Adding callout (${call_x},${call_y}): ${mobj.text}`)
                    lvl.callouts.addCallout(call_x,call_y,mobj.text)
                }
                else {
                    throw new Error(`Unsuppoted object in layer ${layer.name}. Only tile and text are supported.`)
                }
            }
        }
    }
    const buf = lvl.serialize()

    tiled.log("Kitty Map export success.")

    return buf
}

function dbg(s:string){
    if(config.debug) tiled.log(s)
}



export function getMapLimits(map:TileMap){
    const limits = {minx:0,
        miny:0,
        maxx:0,
        maxy:0}
    let isdefined = false
    // tiled.log(`Now looping over ${map.layerCount} layers to find the extent.`)
    // tiled.alert("log")
    for(let layer_i = 0; layer_i<map.layerCount; layer_i++) {
        const layer = map.layerAt(layer_i)
        if(!layer.isTileLayer) continue;
        const region = (layer as TileLayer).region()

        if(!isdefined){
            isdefined = true
            limits.minx = region.boundingRect.x
            limits.miny = region.boundingRect.y
            limits.maxx = region.boundingRect.x + region.boundingRect.width
            limits.maxy = region.boundingRect.y + region.boundingRect.height
            continue
        }
        limits.minx=Math.min(limits.minx,region.boundingRect.x)
        limits.miny=Math.min(limits.miny,region.boundingRect.y)
        limits.maxx = Math.max(limits.maxx,region.boundingRect.x+region.boundingRect.width)
        limits.maxy =  Math.max(limits.maxy,region.boundingRect.y+region.boundingRect.height)
    }
    return limits
}

