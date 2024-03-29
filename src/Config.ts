import { Emoji, Message, Role } from "discord.js";
import mongoose from "mongoose";
import { JsonCommand } from "./handlers/commandHandler";

const configSchema = new mongoose.Schema<Config>({
    id: String,
    reactionMessages: {
        enabled: Boolean,
        messages: [],
    },
    customCommands: {
        enabled: Boolean,
        commands: {
            type: Map,
            of: {
                commandJSON: {
                    options: [],
                    name: String,
                    description: String,
                },
                response: String,
            },
        },
    },
    memberCount: {
        enabled: Boolean,
        channelName: String,
    },
    joinRole: {
        enabled: Boolean,
        roleId: String,
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
        ranklistImage: Buffer,
        points: {
            type: Map,
            of: Number,
        },
        defaultOffset: Number,
        multiplier: Number,
    },
    birthdays: {
        enabled: Boolean,
        dates: { type: Map, of: [Number] },
        announcementChannel: String,
        role: String,
        active: [String],
    },
});

const configModel = mongoose.model("Config", configSchema);
export async function loadConfig(id: string): Promise<Config> {
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
                commands: new Map<string, JsonCommand>(),
            },
            memberCount: {
                enabled: true,
                channelName: "👥 Members: ",
            },
            joinRole: {
                enabled: true,
                roleId: null,
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
                ranklistImage: null,
                points: new Map<string, number>(),
                defaultOffset: 10,
                multiplier: 50,
            },
            birthdays: {
                enabled: true,
                dates: new Map<string, BirthDate>(),
                announcementChannel: null,
                role: null,
                active: [],
            },
        } as unknown as Config;
        res = await configModel.create(newConfig);
    }

    return res as Config;
}

export async function deleteConfig(id: string): Promise<mongoose.Document> {
    const res = await configModel.deleteOne({ id });
    return res;
}

export interface Config extends mongoose.Document {
    id: string;
    reactionMessages: ReactionMessageConfig;
    customCommands: CustomCommandsConfig;
    memberCount: MemberCountConfig;
    joinRole: JoinRoleConfig;
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

export interface CustomCommandsConfig extends ModuleConfig {
    commands: Map<string, JsonCommand>;
}

export interface MemberCountConfig extends ModuleConfig {
    channelName: string;
}

export interface JoinRoleConfig extends ModuleConfig {
    roleId: string | null;
}

export interface ReactionMessageConfig extends ModuleConfig {
    messages: ReactionMessage[];
}

export interface LevelsystemConfig extends AnnouncementConfig {
    color: string;
    levelImage: Buffer | null;
    ranklistImage: Buffer | null;
    points: Map<string, number>;
    defaultOffset: number;
    multiplier: number;
}

export interface BirthdayConfig extends AnnouncementConfig {
    dates: Map<string, BirthDate>;
    role: string | null;
    active: string[];
}

export type BirthDate = number[];

export type ReactionMessage = {
    message: Message;
    roles: Map<Emoji, Role>;
};
