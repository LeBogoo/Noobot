import { Emoji, Message, Role, TextChannel } from "discord.js";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { PATHS } from "./helper";

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
