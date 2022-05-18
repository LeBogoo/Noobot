import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";


export default {
    builder: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),

    run: async function (interaction: CommandInteraction) {
        interaction.reply("Apongus!");
    }
}