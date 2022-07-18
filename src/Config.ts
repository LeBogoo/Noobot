import { Emoji, Message, Role, TextChannel } from "discord.js";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { PATHS } from "./helper";

export class GuildConfig {
    id: string = "";
    reactionMessages: ReactionMessageConfig = {
        enabled: false,
        messages: [],
    };

    customCommands: CustomCommandsConfig = {
        enabled: true,
    };

    twitch: TwitchConfig = {
        enabled: true,
        streamers: [],
        liveMessages: [],
        streamersLive: [],
        lastStreams: new Map<string, number>(),
        announcementChannel: null,
    };

    levelsystem: LevelsystemConfig = {
        enabled: true,
        announcementChannel: null,
        color: "ffffff",
    };

    birthdays: BirthdayConfig = {
        enabled: true,
        birthdays: new Map<string, BirthDate>(),
        announcementChannel: null,
    };

    constructor(id: string) {
        this.id = id;
    }

    save() {
        mkdirSync(PATHS.guild_folder(this.id), { recursive: true });
        writeFileSync(`${PATHS.guild_folder(this.id || "")}/config.json`, JSON.stringify(this, null, 4));
    }

    static load(id: string): GuildConfig {
        try {
            let loaded = JSON.parse(readFileSync(`${PATHS.guild_folder(id || "")}/config.json`).toString());
            return Object.assign(new GuildConfig(id), loaded);
        } catch {
            return new GuildConfig(id);
        }
    }
}

export interface ModuleConfig {
    enabled: boolean;
}

export interface AnnouncementConfig extends ModuleConfig {
    announcementChannel: string | null;
}

export interface TwitchConfig extends AnnouncementConfig {
    streamers: string[];
    liveMessages: string[];
    streamersLive: string[];
    lastStreams: Map<string, number>;
    announcementChannel: string | null;
}

export interface CustomCommandsConfig extends ModuleConfig {}

export interface ReactionMessageConfig extends ModuleConfig {
    messages: ReactionMessage[];
}

export interface LevelsystemConfig extends AnnouncementConfig {
    color: string;
}

export interface BirthdayConfig extends AnnouncementConfig {
    birthdays: Map<string, BirthDate>;
}

export type BirthDate = {
    day: number;
    month: number;
};

export type ReactionMessage = {
    message: Message;
    roles: Map<Emoji, Role>;
};
