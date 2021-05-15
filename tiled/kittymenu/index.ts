import {allPaintTilesets, baseTileset, mapTileset, robotTileset} from "./kittyTileSets";
import {fixFlippedCells} from "./fixFlippedCells";


export function register(){
    tiled.log("Now registering Kitty menu tool.")
    {
        const action = tiled.registerAction("OpenKittyTilesets", function (action) {
            allPaintTilesets()
            mapTileset()
            robotTileset()
            baseTileset()
        })
        action.text = "Open Kitty Tilesets"
        action.checkable = false
        action.iconVisibleInMenu = true
        action.icon = 'rwk/tiles/kitty.png'

        tiled.extendMenu("Edit", [
            { action: "OpenKittyTilesets", before: "SelectAll" },
            { separator: true }
        ]);

    }
    {
        const action = tiled.registerAction("FixKittyMap", function (action) {
            if (!tiled.activeAsset.isTileMap) throw new Error("Action is only applicable to maps.")
            fixFlippedCells(tiled.activeAsset as TileMap)
        })
        action.text = "Fix Kitty Map"
        action.checkable = false
        action.iconVisibleInMenu = true
        action.icon = 'rwk/tiles/kitty.png'


        tiled.extendMenu("Edit", [
            {action: "FixKittyMap", before: "OpenKittyTilesets"},
        ]);
    }

    {
        const package_json = require('../../package.json')
        const action = tiled.registerAction("AboutKitty", function (action) {
            tiled.alert("" +
                "Extension for Robot Wants Kitty level files\n"+
                `by ${package_json.author}\n`+
                `version ${package_json.version}\n`+
                `homepage ${package_json.homepage}`
                ,"About Kitty")
        })
        action.text = "About .kitty extension"
        action.checkable = false
        action.iconVisibleInMenu = true
        action.icon = 'rwk/tiles/kitty.png'


        tiled.extendMenu("Help", [
            {action: "AboutKitty"},
        ]);
    }
}