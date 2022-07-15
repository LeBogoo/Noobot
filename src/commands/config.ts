import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { createWriteStream, unlinkSync } from "fs";
import fetch from "node-fetch";
import { GuildConfig } from "../Config";
import { PATHS } from "../helper";
import { BotCommand } from "../types";
const gm = require("gm").subClass({ imageMagick: true });

const { PermissionFlagsBits } = require("discord-api-types/v10");

async function downloadFile(url: string, path: string) {
    const res = await fetch(url);
    const fileStream = createWriteStream(path);
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
    });
}

async function levelsystemGroupHandler(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const config = GuildConfig.load(interaction.guild!.id);

    switch (subcommand) {
        case "color": {
            const hexcode = interaction.options.getString("hexcode")?.toLocaleLowerCase() || "ffffff";
            const match = hexcode.match(/[0-f]{6}/);
            if (match) {
                config.levelsystem.color = match[0];
                interaction.reply(`Set levelsystem color to \`#${match[0]}\`.`);
            } else
                interaction.reply(
                    "Please enter a valid hex code. Here you can find valid hex codes: https://www.google.com/search?q=colorpicker"
                );
            break;
        }

        case "levelimage": {
            const levelImageAttachment = interaction.options.getAttachment("image");
            if (levelImageAttachment) {
                const tempfilePath = `${PATHS.guild_folder(interaction.guild?.id)}/tempLevelImageFile`;
                interaction.deferReply();
                await downloadFile(levelImageAttachment.url, tempfilePath);

                gm(tempfilePath).identify((err, data) => {
                    if (err) {
                        unlinkSync(tempfilePath);
                        return interaction.editReply("Please upload an image file.");
                    }
                    gm(tempfilePath)
                        .resizeExact(720, 200)
                        .write(`${PATHS.guild_folder(interaction.guild?.id)}/LevelBackdrop.png`, (err) => {
                            if (err)
                                return interaction.editReply(
                                    `There was an error while processing your image.\n\`\`\`json\n${JSON.stringify(
                                        err,
                                        null,
                                        2
                                    )}\n\`\`\``
                                );
                            unlinkSync(tempfilePath);
                        });

                    interaction.editReply(`Saved image!`);
                });
                break;
            } else interaction.reply("Please attach an image.");
            break;
        }

        case "enable": {
            const enable = interaction.options.getBoolean("enable");
            config.levelsystem.enabled = enable === null ? true : enable;
            interaction.reply(`${config.levelsystem.enabled ? "Enabled" : "Disabled"} levelsystem.`);
            /**
             * @todo remove levelsystem commands if disabled, add them if enabled
             */
            break;
        }
    }

    config.save();
}

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Configure bot settings for this Server.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommandGroup((group) =>
            group
                .setName("levelsystem")
                .setDescription("Configure settings about the level system")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("enable")
                        .setDescription("Enables/Disables the levelsystem")
                        .addBooleanOption((option) =>
                            option.setName("enable").setDescription("Should this module be enabled?").setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("color")
                        .setDescription("Sets the color for level messages")
                        .addStringOption((option) =>
                            option.setName("hexcode").setDescription("Example: #ff0000").setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("levelimage")
                        .setDescription("Sets the background image of level messages")
                        .addAttachmentOption((option) =>
                            option
                                .setName("image")
                                .setDescription(
                                    "Please select an image you want to use. Ideal resolution is 720x200px."
                                )
                                .setRequired(true)
                        )
                )
        ),
    run: function (interaction: CommandInteraction) {
        const commandGroup = interaction.options.getSubcommandGroup();

        switch (commandGroup) {
            case "levelsystem":
                levelsystemGroupHandler(interaction);
                break;

            default:
                return `Unsupported configuration option.`;
        }
    },
} as BotCommand;
