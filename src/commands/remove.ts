import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { unlinkSync } from "fs";
import { isCommand, isCustomCommand, PATHS } from "../helper";
import { BotCommand } from "../types";
const { REST } = require("@discordjs/rest");
const { Routes, PermissionFlagsBits } = require("discord-api-types/v10");

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Removes a custom command.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)

        .addStringOption((option) =>
            option.setName("name").setDescription("The name of the command that should be removed.").setRequired(true)
        ),

    run: async function (interaction: CommandInteraction) {
        const name = interaction.options.getString("name")?.toLocaleLowerCase() || "defaultname";

        if (isCommand(name)) return `You cannot remove the default commands.`;
        if (!isCustomCommand(name, interaction.guild)) return `Command \`${name}\` doesnt exist!`;

        const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

        const res = await rest.get(
            Routes.applicationGuildCommands(interaction.client.application?.id, interaction.guild?.id)
        );
        let command = res.find((cmd: { name: string }) => cmd.name == name);

        await rest.delete(
            Routes.applicationGuildCommands(interaction.client.application?.id, interaction.guild?.id) +
                "/" +
                command.id
        );

        unlinkSync(`${PATHS.guild_folder(interaction.guild?.id)}/customCommands/${name}.json`);

        return `Command \`${name}\` removed!`;
    },
} as unknown as BotCommand;
