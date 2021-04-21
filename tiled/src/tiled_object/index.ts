
interface tiled_object {
    version : string ,//[read‑only]	Currently used version of Tiled.
    platform : string ,//[read‑only]	Operating system. One of windows, macos, linux or unix (for any other UNIX-like system).
    arch : string ,//[read‑only]	Processor architecture. One of x64, x86 or unknown.
    actions : string[],// [read‑only]	Available actions for tiled.trigger().
    menus : string[],// [read‑only]	Available menus for tiled.extendMenu().
    // activeAsset : Asset,//	Currently selected asset, or null if no file is open. Can be assigned any open asset in order to change the active asset.
    // openAssets : Asset[],// [read‑only]	List of currently opened assets.
    mapEditor : MapEditor,//	Access the editor used when editing maps.
    // tilesetEditor : TilesetEditor,//	Access the editor used when editing tilesets.
    tilesetFormats : string[],// [read‑only]	List of supported tileset format names. Use tilesetFormat to get the corresponding format object to read and write files. (Since 1.4)
    mapFormats : string[],// [read‑only]

    log:(msg:string)=>void,
    alert:(msg:string,title?:string)=>void,
}

// export function Tiled():tiled_object{
//     // @ts-ignore
//     return tiled;
// }
export let tiled:tiled_object