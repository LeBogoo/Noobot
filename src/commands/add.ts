import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { readdirSync, writeFileSync } from "fs";
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
    run: function (interaction: CommandInteraction) {
        const customCommands = readdirSync("./src/commands");

        console.log(customCommands);

        const name = interaction.options.getString("name") || "defaultname";
        const description = interaction.options.getString("description") || "Default Description";
        const response = interaction.options.getString("response") || "Default Response";

        console.log(name, description, response);


        if (customCommands.includes(`${name}.ts`)) return `Command \`${name}\` already exists!`;

        const command: JsonCommand = {
            commandJSON: new SlashCommandBuilder()
                .setName(name)
                .setDescription(description)
                .toJSON(),
            response: response,
        };

        writeFileSync(`./src/customCommands/${name}.json`, JSON.stringify(command));
        return `Command \`${name}\` added!`;
    }
} as unknown as BotCommand;