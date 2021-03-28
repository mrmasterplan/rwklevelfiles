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
}



if (!fs.existsSync(config.screenshots_dir)){
    fs.mkdirSync(config.screenshots_dir);
}

if (!fs.existsSync(config.db.backup)){
    fs.mkdirSync(config.db.backup);
}

export default config;