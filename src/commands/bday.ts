import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { loadConfig } from "../Config";
import { BotCommand } from "../handlers/commandHandler";
import { days, months } from "../helper";

const monthChoices = months.map((month, index) => {
    return { name: month, value: index };
});

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Sets your Birthday.")
        .setDMPermission(false)

        .addNumberOption((option) =>
            option
                .setName("month")
                .setDescription("Your Birthmonth")
                .addChoices(...monthChoices)
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option.setName("day").setDescription("Your Birthday").setMinValue(1).setMaxValue(31).setRequired(true)
        ),
    run: async function (interaction: CommandInteraction) {
        const month = interaction.options.getNumber("month", true);
        const day = interaction.options.getNumber("day", true);

        const guildConfig = await loadConfig(interaction.guild!.id);
        guildConfig.birthdays.birthdays.set(interaction.member!.user.id, [day, month + 1]);
        guildConfig.save();
        return `Your birthday was set to ${days[day - 1]} of ${months[month]}`;
    },
} as unknown as BotCommand;
