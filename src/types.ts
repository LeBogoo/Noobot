import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { CommandInteraction, Emoji, Message, Role, TextChannel } from "discord.js";

export type JsonCommand = {
    commandJSON: RESTPostAPIApplicationCommandsJSONBody;
    response: string;
};

export type BotCommand = {
    builder: SlashCommandBuilder;
    run: (interaction: CommandInteraction) => string;
};

export type GuildConfig = {
    id: string;
    reactionMessages: ReactionMessage[];
    twitch: TwitchConfig;
    birthdays: BirthdayConfig;
};

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
