import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Config, loadConfig } from "../Config";
import { BotCommand, getCustomCommand, isCommand } from "../handlers/commandHandler";
const { REST } = require("@discordjs/rest");
const { Routes, PermissionFlagsBits } = require("discord-api-types/v10");

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Removes a custom command.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addStringOption((option) =>
            option.setName("name").setDescription("The name of the command that should be removed.").setRequired(true)
        ),
    check: async function (guildConfig: Config) {
        return guildConfig.customCommands.enabled;
    },
    run: async function (interaction: CommandInteraction) {
        const name = interaction.options.getString("name")?.toLocaleLowerCase() || "defaultname";
        const guildConfig = await loadConfig(interaction.guild!.id);

        if (isCommand(name)) return `You cannot remove the default commands.`;
        if (!getCustomCommand(guildConfig.customCommands, name)) return `Command \`${name}\` doesnt exist!`;

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

        guildConfig.customCommands.commands.delete(name);
        guildConfig.save();

        return `Command \`${name}\` removed!`;
    },
} as unknown as BotCommand;
