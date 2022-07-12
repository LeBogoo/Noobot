import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { writeFileSync } from "fs";
import { isCommand, isCustomCommand, PATHS } from "../helper";
import { BotCommand, JsonCommand } from "../types";
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Adds a custom command.")
        .addStringOption((option) => option
            .setName("name")
            .setDescription("The name of the command.")
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName("description")
            .setDescription("The description of the command.")
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName("response")
            .setDescription("The response of the command.")
            .setRequired(true)
        ),
    run: function (interaction: CommandInteraction) {
        const name = interaction.options.getString("name") || "defaultname";
        const description = interaction.options.getString("description") || "Default Description";
        const response = interaction.options.getString("response") || "Default Response";

        if (isCommand(name) || isCustomCommand(name)) return `Command \`${name}\` already exists!`;

        const command: JsonCommand = {
            commandJSON: new SlashCommandBuilder()
                .setName(name)
                .setDescription(description)
                .toJSON(),
            response: response,
        };

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
        rest.put(
            Routes.applicationGuildCommands(interaction.client.application?.id, interaction.guild?.id),
            { body: [command.commandJSON] },
        );

        writeFileSync(`${PATHS.CUSTOM_COMMANDS}/${name}.json`, JSON.stringify(command));
        return `Command \`${name}\` added!`;
    }
} as unknown as BotCommand;