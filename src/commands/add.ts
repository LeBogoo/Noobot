import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { readdirSync } from "fs";
import { BotCommand, JsonCommand } from "../types";

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
    run: async function (interaction: CommandInteraction) {
        const customCommands = readdirSync("./src/commands");

        const name = interaction.options.getString("name") || "Default Name";
        const description = interaction.options.getString("description") || "Default Description";
        const response = interaction.options.getString("response") || "Default Response";
        if (customCommands.includes(`${name}.ts`)) return `Command \`${name}\` already exists!`;

        const command: JsonCommand = {
            commandJSON: new SlashCommandBuilder()
                .setName(name)
                .setDescription(description)
                .toJSON(),
            response: response,
        };

        return `\`\`\`json\n${JSON.stringify(command, null, 2)}\n\`\`\``;
    }
} as unknown as BotCommand;