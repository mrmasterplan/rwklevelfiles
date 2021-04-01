import dotenv from 'dotenv';
import fs from 'fs';
const envFound = dotenv.config();


const config = {
    rwk_url: 'http://robotwantskitty.com/web/',
    db: {
        name: "/RAPTISOFT_SANDBOX",
        filestore: "FILE_DATA",
        backup: process.env.RWK_FULL_DB || "db",
    },
    screenshots_dir: process.env.RWK_SCREENSHOTS || "screenshots",

    stats: {
        dir: process.env.RWK_STATS_DIR || "statistics",
        delimiter: process.env.RWK_STATS_DELIMITER || ","
    },

    levels: {
        bin_dir:"levels"
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
        library_dir: "tiles",

        tile_width:40,
        tile_height:40,
    },

    fuzzer: {
        dir: "fuzzer",
        screen:{
            dir:"screens",
            start:"startscreen.png",
        },
        tiles:"tiles",
        special_tiles:"specials",
        fuzz_file: process.env.RWK_FUZZ_FILE|| "fuzz.json",
        db: "db",
        sleep: 300,
        headless:false,
    }
}


if (!fs.existsSync(config.screenshots_dir)){
    fs.mkdirSync(config.screenshots_dir);
}

if (!fs.existsSync(config.db.backup)){
    fs.mkdirSync(config.db.backup);
}

if (!fs.existsSync(config.stats.dir)){
    fs.mkdirSync(config.stats.dir);
}

export default config;