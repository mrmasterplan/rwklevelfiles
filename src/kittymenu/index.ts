

function getExtBasePath(){
    const userProfile = new Process().getEnv('USERPROFILE')
    if(userProfile){
        //assume windows
        return `${userProfile}\\AppData\\Local\\Tiled\\extensions\\rwk`
    }else{
        //assume linux
        return `~/.config/tiled/extensions/rwk`
    }
}

export function allPaintTilesets(){
    const base_path =getExtBasePath()
    const paths = [
        `${base_path}/tilesets/acid.json`,
        `${base_path}/tilesets/alu.json`,
        `${base_path}/tilesets/grate.json`,
        `${base_path}/tilesets/lava.json`,
        `${base_path}/tilesets/mario.json`,
        `${base_path}/tilesets/mesh.json`,
        `${base_path}/tilesets/panels.json`,
        `${base_path}/tilesets/steel.json`,
        `${base_path}/tilesets/velcro.json`,
        `${base_path}/tilesets/warn.json`,
    ]
    const tilesets:Tileset[]=[]
    for (let p of paths){
        const item = tiled.open(p)
        if(!item) throw new Error(`Unable to open tileset ${p}`)
        tilesets.push(item as unknown as Tileset)
    }
    return tilesets
}

export function baseTileset(){
    const base_path =getExtBasePath()
    const tileset = tiled.open(`${base_path}/tilesets/base.json`)
    if(!tileset) throw new Error("Unable to open base tileset")
    return tileset as unknown as Tileset
}

export function mapTileset(){
    const base_path =getExtBasePath()
    const tileset = tiled.open(`${base_path}/tilesets/map.json`)
    if(!tileset) throw new Error("Unable to open map tileset")
    return tileset as unknown as Tileset
}


export function robotTileset(){
    const base_path =getExtBasePath()
    const tileset = tiled.open(`${base_path}/tilesets/robot.json`)
    if(!tileset) throw new Error("Unable to open robot tileset")
    return tileset as unknown as Tileset
}




export function register(){
    tiled.log("Now registering Kitty menu tool.")

    var action = tiled.registerAction("OpenKittyTilesets", function(action) {
        allPaintTilesets()
        mapTileset()
        robotTileset()
        baseTileset()
    })

    action.text = "Open Kitty Tilesets"
    action.checkable = false
    // action.shortcut = "Ctrl+K"

    tiled.extendMenu("Edit", [
        { action: "OpenKittyTilesets", before: "SelectAll" },
        { separator: true }
    ]);
}