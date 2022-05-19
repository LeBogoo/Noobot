import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { readdirSync } from "fs";
import { BotCommand } from "../types";

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Adds a custom command.")
        .setName("add")
        .addStringOption(Omit<SlashCommandStringOption, "">)
        ,

    run: async function (interaction: CommandInteraction) {
        const customCommands = readdirSync("./src/commands");
        
        // const embed = new MessageEmbed();

        // for (let command of commands) {
        //     const commandName = command.split(".")[0];
        //     const commandModule = (await import(`../commands/${command}`)).default;

        //     embed.addField(commandName, commandModule.builder.description);
        // }

        // interaction.reply({ content: "Here is what i've found!", embeds: [embed] });
    }
} as BotCommand;