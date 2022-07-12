import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { writeFileSync } from "fs";
import { PATHS } from "../helper";

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Give the developer feedback on bugs or additional features or ideas!")
        .addStringOption((option) => option
            .setName("title")
            .setDescription("Short title about your problem/idea.")
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName("description")
            .setDescription("Describe your problem/idea in a little more detail!")
            .setRequired(true)
        ),

    run: function (interaction: CommandInteraction) {
        const title = interaction.options.getString("title") || "error while getting title";
        const description = interaction.options.getString("title") || "error while getting description";
        const author = interaction.user.username + "#" + interaction.user.discriminator;
        const author_id = interaction.user.id;

        const embed = new MessageEmbed()
            .setTitle("Thanks for your feedback!")
            .setDescription("This is what we've recieved:")
            .addField("Title", title)
            .addField("Description", description)
            .addField("Author", author);

        writeFileSync(`${PATHS.FEEDBACK_PENDING}/${new Date().toString()}.md`, `# ${title}\n\n${description}\n\nBy: ${author} (${author_id})`);

        return { ephemeral: true, embeds: [embed] };
    }
}