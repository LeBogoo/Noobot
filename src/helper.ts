import { readdirSync } from "fs";

export enum PATHS {
    DATA = "./data",
    COMMANDS = "./src/commands",
    CUSTOM_COMMANDS = "./data/customCommands",
    CONFIGS = "./data/configs",
    FEEDBACK_DONE = "./data/feedback/done",
    FEEDBACK_PENDING = "./data/feedback/pending",
}

/**
 * @param name Command name
 * @returns If this default command exists
 */
export function isCommand(name: string): boolean {
    const commands = readdirSync("./src/commands");
    return commands.includes(`${name}.ts`);
}

/**
 * @param name Command name
 * @returns If this custom command exists
 * @todo Make it guild independent!
 */
export function isCustomCommand(name: string): boolean {
    const commands = readdirSync("./data/customCommands");
    return commands.includes(`${name}.json`);
}
