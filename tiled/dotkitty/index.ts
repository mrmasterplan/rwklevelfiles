import {Level, normalizedTileValue} from "../../src/level";
import {allPaintTilesets, baseTileset, mapTileset, robotTileset} from "../kittymenu";

var Buffer = require('buffer/').Buffer

interface dotkitty_type extends MapFormat {

}

const dotkitty = {
    name:'RwK Level',
    extension:'kitty'
} as dotkitty_type




dotkitty.read = function (fileName:string){
    tiled.log(`Attempting to open ${fileName}`)
    const map = new TileMap()
    map.setTileSize(40,40)
    map.infinite = true

    tiled.log('Read operation started')
    tiled.log('Parse all tilesets')
    const paint_registry:{[key:number]:Tile} = {}
    const base_registry:{[key:number]:Tile} = {}
    const map_registry:{[key:number]:Tile} = {}
    const robot_registry:{robot?:Tile,kitty?:Tile} = {}
    for (let set of allPaintTilesets()) {
        for (let tile of set.tiles) {
            const index = tile.property('paint')
            if (!index) throw new Error(`tile in paint tileset ${set.name} has no paint property`)
            paint_registry[normalizedTileValue(+index)] = tile
        }
    }
    for (let tile of baseTileset().tiles) {
        const index = tile.property('base')
        if(!index)throw new Error(`tile in base tileset has no base property`)
        base_registry[normalizedTileValue(+index)] = tile
    }
    for (let tile of mapTileset().tiles) {
        const index = tile.property('map')
        if(!index)throw new Error(`tile in map tileset has no map property`)
        map_registry[normalizedTileValue(+index)] = tile
    }
    for (let tile of robotTileset().tiles) {
        const kind = tile.property('kind')
        if(!kind)throw new Error(`tile in robot tileset has no kind property`)
        if(kind === 'robot') robot_registry.robot = tile
        else if(kind ==='kitty')robot_registry.kitty = tile
        else throw new Error(`tile in robot tileset has invalid kind property ${kind}`)
    }

    if(!robot_registry.robot || !robot_registry.kitty) throw new Error(`robot and/or kitty tiles not found`)

    const bs = new BinaryFile(fileName,BinaryFile.ReadOnly);
    const buf = Buffer.from(bs.readAll())
    bs.close()
    tiled.log('Binary file read to memory.')

    const lvl = Level.from(buf)
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

    const base_edit = baseLayer.edit()
    const map_edit = mapLayer.edit()
    const paint_edit = paintLayer.edit()
    for(let j=0;j<lvl.grid.size_y;j++) {
        for (let i = 0; i < lvl.grid.size_x; i++) {
            const cell = lvl.grid.getCellObj(i,j)
            // stop! we need to open the tilesets, then parse them
            base_edit.setTile(i,j,base_registry[cell.base])
            paint_edit.setTile(i,j,paint_registry[cell.paint])
            map_edit.setTile(i,j,map_registry[lvl.grid.getMapCell(i,j)])
        }
    }

    base_edit.apply()
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

    tiled.trigger('FitInView')
    return map
}


dotkitty.write=function(map:TileMap, fileName:string) {
    const name_match = fileName.match(/[^\/]*\.kitty$/)
    const name=name_match?name_match[0].slice(0,-".kitty".length) : map.property('name')?.toString()

    if(!name) throw new Error("Could not determine level name. Please use map property 'name'")

    tiled.log(`Now exporting level ${name}`)
    const lvl = new Level({name})

    if(map.property('name') && map.property('name')!==lvl.name) tiled.alert(`Level name property ignored. Level name will be "${lvl.name}" as filename.`)

    lvl.footer.belt_speed = parseFloat(map.property("conveyor_speed")?.toString()||"0.6")
    lvl.footer.music[0] = map.property('music_red')?.toString() ||''
    lvl.footer.music[1] = map.property('music_green')?.toString() ||''
    lvl.footer.music[2] = map.property('music_blue')?.toString() ||''
    map.property('tags')?.toString().split(',').map(t=>{if(t)lvl.tags.set_tag(t.trim().toLowerCase())})

    // determine actual map size. (a bit complicated for infinite maps)
    let limits:{[key:string]:number} = {}
    tiled.log(`Now looping over ${map.layerCount} layers to find the extent.`)
    // tiled.alert("log")
    for(let layer_i = 0; layer_i<map.layerCount; layer_i++) {
        const layer = map.layerAt(layer_i)
        if(!layer.isTileLayer) continue;
        const region = (layer as TileLayer).region()

        if(typeof limits.minx == "undefined") limits.minx = region.boundingRect.x
        limits.minx=Math.min(limits.minx,region.boundingRect.x)

        if(typeof limits.miny == "undefined") limits.miny = region.boundingRect.y
        limits.miny=Math.min(limits.miny,region.boundingRect.y)

        const maxx = region.boundingRect.x+region.boundingRect.width
        limits.maxx = typeof limits.maxx == "undefined" ? maxx : Math.max(limits.maxx,maxx)

        const maxy = region.boundingRect.y+region.boundingRect.height
        limits.maxy = typeof limits.maxy == "undefined" ? maxy : Math.max(limits.maxy,maxy)
    }


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

    tiled.log("Kitty Map export success.")
    const bs = new BinaryFile(fileName,BinaryFile.WriteOnly);
    const buf = lvl.serialize()
    bs.resize(buf.length)
    bs.write(buf.buffer)
    bs.commit()
    //bs.close()


    return ''
}


export function register(){
    tiled.log(`registering kitty map export format`)
    tiled.registerMapFormat("kitty", dotkitty)
}
