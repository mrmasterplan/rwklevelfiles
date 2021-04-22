import dotenv from 'dotenv';
import fs from 'fs';
const envFound = dotenv.config();


const config = {
    rwk_url: 'http://robotwantskitty.com/web/',
    db: {
        name: "/RAPTISOFT_SANDBOX",
        filestore: "FILE_DATA",
        backup: process.env.RWK_FULL_DB || "db.json",
        levels_out: "levels_out",
        levels_in: "levels_in",
    },
    screenshots_dir: process.env.RWK_SCREENSHOTS || "screenshots",

    levels: {
        bin_dir:"levels"
    },

    editor:{
        resources: "resources",
        tilesets: "tilesets",
        level_conversion_dir: "levels_to_convert",
        level_conversion: "levels_to_convert/*.json",
        fuzz: "fuzz",
        tiles: "tiles",
        base_tile_values:[
            0x01,
            0x02,
            0x03,
            0x04,
            0x05,
            0x06,
            0x07,
            0x08,
            0x09,
            0x0a,
            0x0b,
            0x0c,
            0x0d,
            0x0e,
            0x0f,
            0x10,
            0x11,
            0x12,
            0x13,
            0x14,
            0x15,
            0x16,
            0x17,
            0x18,
            0x19,
            0x1a,
            0x1b,
            0x1c,
            0x1d,
            0x1e,
            0x1f,
            0x20,
            0x21,
            0x22,
            0x23,
            0x24,
            0x25,
            0x26,
            0x27,
            0x28,
            0x29,
            0x2a,
            0x2b,
            0x2c,
            0x2d,
            0x2e,
            0x2f,
            0x30,
            0x31,
            0x32,
            0x33,
            0x34,
            0x35,
            0x36,
            0x37,
            0x38,
            0x39,
            0x3a,
            0x3b,
            0x3c,
            0x3d,
            0x3e,
            0x3f,
            0x40,
            0x41,
            0x42,
            0x43,
            0x44,
            0x45,
            0x46,
            0x47,
            0x48,
            0x49,
            0x51,
        ],
        max_base_value: 100,
    },

    tile_library:{
        // url:{
        //     // base:"http://www.raptisoft.com/rwk/tutorial/",
        //     http_opts:{
        //         host: "www.raptisoft.com",
        //         path: "/rwk/tutorial/"
        //     },
        //     image_link_regex: '"(?<path>images/tiles/IMG_(?<index>\\d+?)\\.png)"', //make sure the path and index groups exist.
        //
        // },
        library_dir: "resources/tiles",
        tiles_to_download: [
            { index:  2-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_002.png" },
            { index:  3-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_003.png" },
            { index:  4-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_004.png" },
            { index:  5-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_005.png" },
            { index:  6-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_006.png" },
            { index:  7-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_007.png" },
            { index:  8-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_008.png" },
            { index:  9-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_009.png" },
            { index: 10-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_010.png" },
            { index: 11-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_011.png" },
            { index: 12-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_012.png" },
            { index: 13-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_013.png" },
            { index: 14-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_014.png" },
            { index: 15-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_015.png" },
            { index: 16-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_016.png" },
            { index: 17-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_017.png" },
            { index: 18-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_018.png" },
            { index: 19-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_019.png" },
            { index: 20-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_020.png" },
            { index: 21-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_021.png" },
            { index: 22-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_022.png" },
            { index: 23-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_023.png" },
            { index: 24-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_024.png" },
            { index: 25-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_025.png" },
            { index: 26-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_026.png" },
            { index: 27-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_027.png" },
            { index: 28-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_028.png" },
            { index: 29-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_029.png" },
            { index: 31-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_031.png" },
            { index: 32-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_032.png" },
            { index: 33-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_033.png" },
            { index: 34-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_034.png" },
            { index: 35-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_035.png" },
            { index: 36-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_036.png" },
            { index: 38-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_038.png" },
            { index: 39-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_039.png" },
            { index: 40-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_040.png" },
            { index: 41-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_041.png" },
            { index: 42-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_042.png" },
            { index: 43-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_043.png" },
            { index: 44-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_044.png" },
            { index: 45-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_045.png" },
            { index: 46-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_046.png" },
            { index: 47-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_047.png" },
            { index: 48-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_048.png" },
            { index: 49-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_049.png" },
            { index: 50-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_050.png" },
            { index: 51-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_051.png" },
            { index: 52-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_052.png" },
            { index: 53-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_053.png" },
            { index: 54-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_054.png" },
            { index: 55-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_055.png" },
            { index: 56-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_056.png" },
            { index: 57-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_057.png" },
            { index: 58-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_058.png" },
            { index: 59-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_059.png" },
            { index: 60-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_060.png" },
            { index: 61-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_061.png" },
            { index: 62-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_062.png" },
            { index: 63-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_063.png" },
            { index: 64-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_064.png" },
            { index: 65-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_065.png" },
            { index: 66-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_066.png" },
            { index: 67-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_067.png" },
            { index: 68-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_068.png" },
            { index: 69-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_069.png" },
            { index: 70-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_070.png" },
            { index: 71-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_071.png" },
            { index: 72-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_072.png" },
            { index: 73-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_073.png" },
            { index: 74-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/IMG_074.png" },
            { index: 30-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/img_030.png" },
            { index: 37-1, url:"http://www.raptisoft.com/rwk/tutorial/images/tiles/img_037.png" },


        ],

        tile_width:40,
        tile_height:40,

        map_base_tile: "resources/base_tiles/basic_map_tile.png",
        special_tiles: [
            "resources/base_tiles/51000000.png"
        ],
    },

    fuzzer: {
        fuzz_files: "resources/fuzz/*.fuzz.json",
        tmp: "tmp",
        tiles:"resources/tiles",
        db: "db",
        sleep: 300,
        headless:false,
    },

    dev:{
        base_levels: 'resources/base_levels'
    }
}


if (!fs.existsSync(config.editor.level_conversion_dir)){
    fs.mkdirSync(config.editor.level_conversion_dir);
}

if (!fs.existsSync(config.screenshots_dir)){
    fs.mkdirSync(config.screenshots_dir);
}

if (!fs.existsSync(config.db.levels_in)){
    fs.mkdirSync(config.db.levels_in);
}if (!fs.existsSync(config.db.levels_out)){
    fs.mkdirSync(config.db.levels_out);
}


export default config;