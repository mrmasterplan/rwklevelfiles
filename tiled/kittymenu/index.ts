

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
    const paths = [
        `ext:/rwk/tilesets/acid.json`,
        `ext:/rwk/tilesets/alu.json`,
        `ext:/rwk/tilesets/grate.json`,
        `ext:/rwk/tilesets/lava.json`,
        `ext:/rwk/tilesets/mario.json`,
        `ext:/rwk/tilesets/mesh.json`,
        `ext:/rwk/tilesets/panels.json`,
        `ext:/rwk/tilesets/steel.json`,
        `ext:/rwk/tilesets/velcro.json`,
        `ext:/rwk/tilesets/warn.json`,
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
    const tileset = tiled.open(`ext:/rwk/tilesets/base.json`)
    if(!tileset) throw new Error("Unable to open base tileset")
    return tileset as unknown as Tileset
}

export function mapTileset(){
    const tileset = tiled.open(`ext:/rwk/tilesets/map.json`)
    if(!tileset) throw new Error("Unable to open map tileset")
    return tileset as unknown as Tileset
}


export function robotTileset(){
    const tileset = tiled.open(`ext:/rwk/tilesets/robot.json`)
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
    action.iconVisibleInMenu = false

    tiled.extendMenu("Edit", [
        { action: "OpenKittyTilesets", before: "SelectAll" },
        { separator: true }
    ]);
}