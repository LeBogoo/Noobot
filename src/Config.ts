import { Emoji, Message, Role, TextChannel } from "discord.js";
import { PATHS } from "./helper";
import { mkdirSync, writeFileSync, readFileSync } from "fs";

export class GuildConfig {
    id: string = "";
    reactionMessages: ReactionMessage[] = [];
    twitch: TwitchConfig = {
        streamers: [],
        liveMessages: [],
        streamersLive: [],
        lastStreams: new Map<string, number>(),
        announcementChannel: null,
    };
    birthdays: BirthdayConfig = {
        birthdays: new Map<string, BirthDate>(),
        announcementChannel: null,
    };

    constructor(id: string) {
        this.id = id;
    }

    save() {
        mkdirSync(PATHS.guild_config(this.id), { recursive: true });
        writeFileSync(`${PATHS.guild_config(this.id || "")}/config.json`, JSON.stringify(this));
    }

    static load(id: string): GuildConfig {
        try {
            let loaded = JSON.parse(readFileSync(`${PATHS.guild_config(id || "")}/config.json`).toString());
            return Object.assign(new GuildConfig(id), loaded);
        } catch {
            return new GuildConfig(id);
        }
    }
}

export type ReactionMessage = {
    message: Message;
    roles: Map<Emoji, Role>;
};

export type TwitchConfig = {
    streamers: string[];
    liveMessages: string[];
    streamersLive: string[];
    lastStreams: Map<string, number>;
    announcementChannel: TextChannel | null;
};

export type LevelsystemConfig = {
    announcementChannel: TextChannel | null;
    levelFunction: (xp: number) => number;
};

export type BirthdayConfig = {
    birthdays: Map<string, BirthDate>;
    announcementChannel: TextChannel | null;
};

export type BirthDate = {
    day: number;
    month: number;
};

// /**
//  * Helper function to load a GuildConfig object from its default location.
//  * @param guildId Id of the guild
//  * @returns Saved config if found, otherwise newly created config
//  */
// export function getConfig(guildId: string | null): GuildConfig {
//     let config: GuildConfig;
//     try {
//         config = JSON.parse(readFileSync(`${PATHS.guild_config(guildId || "")}/config.json`).toString());
//     } catch (_) {
//         config = createConfig(guildId || "");
//     }
//     return config;
// }

// /**
//  * Helper function to save a GuildConfig object. It automatically saves it at the right location.
//  * @param config Config to be saved.
//  */
// export function saveConfig(config: GuildConfig) {
//     mkdirSync(PATHS.guild_config(config.id), { recursive: true });
//     writeFileSync(`${PATHS.guild_config(config.id || "")}/config.json`, JSON.stringify(config));
// }
