import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { readdirSync } from "fs";

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Lists all commands"),

    run: async function (interaction: CommandInteraction) {
        const commands = readdirSync("./src/commands");
        const embed = new MessageEmbed();

        for (let command of commands) {
            const commandName = command.split(".")[0];
            const commandModule = (await import(`../commands/${command}`)).default;

            embed.addField(commandName, commandModule.builder.description);
        }

        interaction.reply({ content: "Here is what i've found!", embeds: [embed] });
    }
}