import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";


export default {
    builder: new SlashCommandBuilder()
        .setDescription("Replies with Pong!"),

    run: async function (interaction: CommandInteraction) {
        return "Pingeling, Pongelong, Dingeling, Dongelong!";
    }
}