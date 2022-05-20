import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton, Modal, TextInputComponent } from "discord.js";
import { readdirSync } from "fs";
import { BotCommand, JsonCommand } from "../types";

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Test command"),
    run: async function (interaction: CommandInteraction) {
        const modal = new Modal(
            {
                customId: "lol",
                title: "Test Modal",
                components: [

                ],
            }
        );
    }
} as unknown as BotCommand;