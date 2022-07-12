import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { CommandInteraction } from "discord.js";

export type JsonCommand = {
    commandJSON: RESTPostAPIApplicationCommandsJSONBody;
    response: string;
};

export type BotCommand = {
    builder: SlashCommandBuilder;
    run: (interaction: CommandInteraction) => string;
};
