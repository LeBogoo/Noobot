import { Emoji, Message, Role } from "discord.js";
import mongoose from "mongoose";

const configSchema = new mongoose.Schema<Config>({
    id: String,
    reactionMessages: {
        enabled: Boolean,
        messages: [],
    },
    customCommands: {
        enabled: Boolean,
    },
    twitch: {
        enabled: Boolean,
        streamers: [],
        liveMessages: [],
        streamersLive: [],
        lastStreams: {
            type: Map,
            of: String,
        },
        announcementChannel: String,
    },
    levelsystem: {
        enabled: Boolean,
        announcementChannel: String,
        color: String,
        levelImage: Buffer,
    },
    birthdays: {
        enabled: Boolean,
        birthdays: { type: Map, of: [Number] },
        announcementChannel: String,
    },
});

export async function loadConfig(id: string): Promise<Config> {
    const configModel = mongoose.model("Config", configSchema);

    let res = await configModel.findOne({ id });
    if (!res) {
        const newConfig = {
            id: id,
            reactionMessages: {
                enabled: true,
                messages: [],
            },
            customCommands: {
                enabled: true,
            },
            twitch: {
                enabled: true,
                streamers: [],
                liveMessages: [],
                streamersLive: [],
                lastStreams: new Map<string, number>(),
                announcementChannel: null,
            },
            levelsystem: {
                enabled: true,
                announcementChannel: null,
                color: "ffffff",
                levelImage: null,
            },
            birthdays: {
                enabled: true,
                birthdays: new Map<string, BirthDate>(),
                announcementChannel: null,
            },
        } as unknown as Config;
        res = await configModel.create(newConfig);
    }

    return res as Config;
}

export interface Config extends mongoose.Document {
    id: string;
    reactionMessages: ReactionMessageConfig;
    customCommands: CustomCommandsConfig;
    twitch: TwitchConfig;
    levelsystem: LevelsystemConfig;
    birthdays: BirthdayConfig;
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
}

export interface CustomCommandsConfig extends ModuleConfig {}

export interface ReactionMessageConfig extends ModuleConfig {
    messages: ReactionMessage[];
}

export interface LevelsystemConfig extends AnnouncementConfig {
    color: string;
    levelImage: Buffer | null;
}

export interface BirthdayConfig extends AnnouncementConfig {
    birthdays: Map<string, BirthDate>;
}

export type BirthDate = number[];

export type ReactionMessage = {
    message: Message;
    roles: Map<Emoji, Role>;
};
