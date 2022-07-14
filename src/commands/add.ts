import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { writeFileSync } from "fs";
import { isCommand, isCustomCommand, PATHS } from "../helper";
import { BotCommand, JsonCommand } from "../types";
const { REST } = require("@discordjs/rest");
const { Routes, PermissionFlagsBits } = require("discord-api-types/v10");

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Adds a custom command.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addStringOption((option) =>
            option.setName("name").setDescription("The name of the command.").setRequired(true)
        )
        .addStringOption((option) =>
            option.setName("description").setDescription("The description of the command.").setRequired(true)
        )

        .addStringOption((option) =>
            option.setName("response").setDescription("The response of the command.").setRequired(true)
        ),
    run: function (interaction: CommandInteraction) {
        const name = interaction.options.getString("name")?.toLocaleLowerCase() || "defaultname";
        const description = interaction.options.getString("description") || "Default Description";
        const response = interaction.options.getString("response") || "Default Response";

        if (isCommand(name) || isCustomCommand(name, interaction.guild)) return `Command \`${name}\` already exists!`;

        if (!name.match(/^([a-z0-9]{1,30})$/))
            return "Only a maximum of 30 lowercase Latin letters and numbers from 0 to 9 are allowed as name.";

        if (response.length > 500) return "The response cannot exceed 500 characters.";
        if (name.length > 100) return "The name cannot exceed 100 characters.";
        if (description.length > 100) return "The description cannot exceed 100 characters.";

        const command: JsonCommand = {
            commandJSON: new SlashCommandBuilder().setName(name).setDescription(description).toJSON(),
            response: response,
        };

        const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
        rest.post(Routes.applicationGuildCommands(interaction.client.application?.id, interaction.guild?.id), {
            body: command.commandJSON,
        });

        writeFileSync(
            `${PATHS.guild_folder(interaction.guild?.id)}/customCommands/${name}.json`,
            JSON.stringify(command)
        );
        return `Command \`${name}\` added!`;
    },
} as BotCommand;
