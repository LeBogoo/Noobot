import { Guild } from "discord.js";
import { readdirSync, writeFileSync, readFileSync, mkdirSync } from "fs";
import { GuildConfig } from "./types";

export const PATHS = {
    DATA: "./data",
    COMMANDS: "./src/commands",
    CONTEXT_MENUS: "./src/contextMenus",
    CUSTOM_COMMANDS: "./data/customCommands",
    CONFIGS: "./data/configs",
    FEEDBACK_DONE: "./data/feedback/done",
    FEEDBACK_PENDING: "./data/feedback/pending",
    guild_commands: (guildId: string | null | undefined) => `./data/customCommands/${guildId}`,
    guild_config: (guildId: string) => `./data/configs/${guildId}`,
};

export function createConfig(guildId: string): GuildConfig {
    const config: GuildConfig = {
        id: guildId,
        reactionMessages: [],
        twitch: {
            streamers: [],
            liveMessages: [],
            streamersLive: [],
            lastStreams: new Map(),
            announcementChannel: null,
        },
        birthdays: {
            birthdays: new Map(),
            announcementChannel: null,
        },
    };
    return config;
}

/**
 * Helper function to load a GuildConfig object from its default location.
 * @param guildId Id of the guild
 * @returns Saved config if found, otherwise newly created config
 */
export function getConfig(guildId: string | null): GuildConfig {
    let config: GuildConfig;
    try {
        config = JSON.parse(readFileSync(`${PATHS.guild_config(guildId || "")}/config.json`).toString());
    } catch (_) {
        config = createConfig(guildId || "");
    }
    return config;
}

/**
 * Helper function to save a GuildConfig object. It automatically saves it at the right location.
 * @param config Config to be saved.
 */
export function saveConfig(config: GuildConfig) {
    mkdirSync(PATHS.guild_config(config.id), { recursive: true });
    writeFileSync(`${PATHS.guild_config(config.id || "")}/config.json`, JSON.stringify(config));
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
 */
export function isCustomCommand(name: string, guild: Guild | null): boolean {
    const commands = readdirSync(PATHS.guild_commands(guild?.id));
    return commands.includes(`${name}.json`);
}
