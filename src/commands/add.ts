import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Config, loadConfig } from "../Config";
import { BotCommand, getCustomCommand, isCommand, JsonCommand } from "../handlers/commandHandler";
const { REST } = require("@discordjs/rest");
const { Routes, PermissionFlagsBits } = require("discord-api-types/v10");

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Adds a custom command.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((option) =>
            /**
             * @todo: Limit max length to 30 if feature is supported by discord.js
             */
            option.setName("name").setDescription("The name of the command.").setRequired(true)
        )
        .addStringOption((option) =>
            option.setName("description").setDescription("The description of the command.").setRequired(true)
        )

        .addStringOption((option) =>
            option.setName("response").setDescription("The response of the command.").setRequired(true)
        ),

    check: async function (guildConfig: Config) {
        return guildConfig.customCommands.enabled;
    },
    run: async function (interaction: CommandInteraction) {
        const name = interaction.options.getString("name")?.toLocaleLowerCase() || "defaultname";
        const description = interaction.options.getString("description") || "Default Description";
        const response = interaction.options.getString("response") || "Default Response";
        const guildConfig = await loadConfig(interaction.guild!.id);

        if (isCommand(name)) return `You cannot overwrite the default commands.`;
        if (getCustomCommand(guildConfig.customCommands, name)) return `Command \`${name}\` already exists!`;

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

        guildConfig.customCommands.commands.set(name, command);
        guildConfig.save();
        return `Command \`${name}\` added!`;
    },
} as BotCommand;
