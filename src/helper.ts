import { Guild } from "discord.js";
import { readdirSync } from "fs";

export const PATHS = {
    DATA: "./data",
    COMMANDS: "./src/commands",
    CONTEXT_MENUS: "./src/contextMenus",
    CUSTOM_COMMANDS: "./data/customCommands",
    CONFIGS: "./data/configs",
    FEEDBACK_DONE: "./data/feedback/done",
    FEEDBACK_PENDING: "./data/feedback/pending",
    guild_folder: (guildId: string | null | undefined) => `./data/${guildId}`,
};

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
 */
export function isCustomCommand(name: string, guild: Guild | null): boolean {
    const commands = readdirSync(`${PATHS.guild_folder(guild?.id)}/customCommands`);
    return commands.includes(`${name}.json`);
}
