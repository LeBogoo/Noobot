import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Config, loadConfig } from "../Config";
import { BotCommand } from "../handlers/commandHandler";
import { days, months } from "../helper";

const monthChoices = months.map((month, index) => {
    return { name: month, value: index };
});

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Sets your Birthday.")
        .setDMPermission(false)

        .addIntegerOption((option) =>
            option
                .setName("month")
                .setDescription("Your Birthmonth")
                .addChoices(...monthChoices)
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option.setName("day").setDescription("Your Birthday").setMinValue(1).setMaxValue(31).setRequired(true)
        ),
    check: async function (guildConfig: Config) {
        return guildConfig.birthdays.enabled;
    },
    run: async function (interaction: CommandInteraction) {
        const month = interaction.options.getInteger("month", true);
        const day = interaction.options.getInteger("day", true);

        const guildConfig = await loadConfig(interaction.guild!.id);
        guildConfig.birthdays.birthdays.set(interaction.member!.user.id, [day, month + 1]);
        guildConfig.save();
        return `Your birthday was set to ${days[day - 1]} of ${months[month]}`;
    },
} as BotCommand;
