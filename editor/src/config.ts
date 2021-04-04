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
            0x10,
            0x12,
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
        url:{
            // base:"http://www.raptisoft.com/rwk/tutorial/",
            http_opts:{
                host: "www.raptisoft.com",
                path: "/rwk/tutorial/"
            },
            image_link_regex: '"(?<path>images/tiles/IMG_(?<index>\\d+?)\\.png)"', //make sure the path and index groups exist.

        },
        library_dir: "resources/tiles",

        tile_width:40,
        tile_height:40,
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