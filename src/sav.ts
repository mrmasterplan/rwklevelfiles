import {CLI_option} from "./cli";

const config ={
    sav_base_dir:"sav_files",
}

export function add_cli_options(options:{[key:string]:CLI_option}){
    options['sl']={
        description:"sav to level",
        action: async ()=>{

        }
    }
}