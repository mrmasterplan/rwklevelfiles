export interface CLI_option {
    description: string,
    action: () => Promise<void>,
}