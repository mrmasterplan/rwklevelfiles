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
            base:"http://www.raptisoft.com/rwk/tutorial/images/tiles/",
            name_base: "IMG_",
            extension:".png",
            decimals:3,
        },
        lowest_index:1,
        highest_index:74,
        library_dir: "tiles",

        // these do not exist and we do not want to hit non-existing urls. That makes admins suspicious.
        blacklisted_indices:[30,37],
        tile_width:40,
        tile_height:40,
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