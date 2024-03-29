import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Config } from "../Config";
import { BotCommand } from "../handlers/commandHandler";
dotenv.config();

export interface Feedback extends mongoose.Document {
    pending: boolean;
    title: string;
    description: string;
    author: {
        name: string;
        hash: number;
        id: string;
    };
    priority: number;
    date: string;
}

export const feedbackSchema = new mongoose.Schema<Feedback>({
    pending: Boolean,
    title: String,
    description: String,
    author: {
        name: String,
        hash: Number,
        id: String,
    },
    priority: Number,
    date: String,
});

export const feedbackModel = mongoose.model("Feedback", feedbackSchema);

const priorityMap: { [key: number]: string } = {
    1: "(1) Low",
    2: "(2) Medium",
    3: "(3) High",
};

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Give the developer feedback on bugs or additional features or ideas!")
        .addStringOption((option) =>
            option.setName("title").setDescription("Short title about your problem/idea.").setRequired(true)
        )

        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("Describe your problem/idea in a little more detail!")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("priority")
                .setDescription("What do you think should be the priority of this request?")
                .addChoices(
                    { name: priorityMap[1], value: 1 },
                    { name: priorityMap[2], value: 2 },
                    { name: priorityMap[3], value: 3 }
                )
                .setRequired(true)
        ),
    check: async function (_guildConfig: Config) {
        return true;
    },
    run: async function (interaction: CommandInteraction) {
        const title = interaction.options.getString("title", true);
        const description = interaction.options.getString("description", true);
        const priority = interaction.options.getInteger("priority", true);
        const author = interaction.user.username + "#" + interaction.user.discriminator;
        const author_id = interaction.user.id;

        let slicedTitle = title.slice(0, 1000);
        if (slicedTitle != title) slicedTitle += "...";

        let slicedDescription = description.slice(0, 1000);
        if (slicedDescription != description) slicedDescription += "...";

        const embed = new MessageEmbed()
            .setTitle("Thanks for your feedback!")
            .setDescription("This is what we've recieved:")
            .addField("Title", slicedTitle)
            .addField("Description", slicedDescription)
            .addField("Prioriy", priorityMap[priority])
            .addField("Author", author);

        // const filename = `${PATHS.FEEDBACK_PENDING}/${new Date().toDateString()} ${new Date().getTime()}.md`;
        // const content = `# Title: \n${title}\n\n## Description:\n${description}\n\n## By:\n${author} (${author_id})`;

        const feedback = await feedbackModel.create({
            pending: true,
            title: title,
            description: description,
            priority,
            author: {
                name: interaction.user.username,
                hash: interaction.user.discriminator,
                id: interaction.user.id,
            },
            date: new Date().toString(),
        });
        feedback.save();

        // writeFileSync(filename, content);

        if (process.env.FORWARD_FEEDBACK_DM == "true" && process.env.BOTMASTER_ID != "") {
            const botmaster = interaction.client.users.cache.get(process.env.BOTMASTER_ID!);
            const botmasterEmbed = new MessageEmbed(embed);
            botmasterEmbed.setTitle("New feedback arrived!");

            if (botmaster) botmaster.send({ embeds: [botmasterEmbed] });
        }

        return { ephemeral: true, embeds: [embed] };
    },
} as BotCommand;
