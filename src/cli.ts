export interface CLI_option {
    description: string,
    action: () => void,
}

export interface CLI_options {
    [key:string]:CLI_option
}