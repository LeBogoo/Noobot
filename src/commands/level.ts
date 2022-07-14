import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { LevelStorage } from "../LevelStorage";
import { BotCommand } from "../types";

function percentToBars(percent: number, width: number): string {
    let out = "";
    for (let i = 0; i < width; i++) out += percent * width <= i ? "⬛" : "⬜";
    return out;
}

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Shows you what level you are")
        .setDMPermission(false)

        .addUserOption((option) =>
            option.setName("user").setDescription("Mention a user to see their level.").setRequired(false)
        )
        .addBooleanOption((option) =>
            option
                .setName("textversion")
                .setDescription("Set this to true if you only want to receive a text version.")
                .setRequired(false)
        ),

    run: function (interaction: CommandInteraction) {
        const useText = interaction.options.getBoolean("textversion") || false;
        let selectedUser = interaction.options.getUser("user")
            ? interaction.options.getUser("user")
            : interaction.member!.user;

        const storage: LevelStorage = LevelStorage.load(interaction.guild!.id);
        const levelUser = storage.getLevelUser(selectedUser as User);

        if (useText) {
            const embed = new MessageEmbed();
            embed.setTitle(`${levelUser.username} - Level`);
            embed.setDescription(
                `Level: ${levelUser.level} | XP: ${levelUser.relativeXp} | Rank ${levelUser.rank}` +
                `Progress: ${levelUser.relativeXp}/${levelUser.relativeNextLevelXp}\n` +
                `${percentToBars(levelUser.percentage, 10)} (${Math.floor(
                    levelUser.percentage * 100
                )}%)`
            );

            return { embeds: [embed] };
            // return "```json\n" + JSON.stringify(levelUser, null, 2) + "\n```";
        }

        /**
         * @todo Add image generation
         */
        return 'Please set the "textversion" option to true';
    },
} as BotCommand;
