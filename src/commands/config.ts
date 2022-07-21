import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { createWriteStream, unlinkSync } from "fs";
import fetch from "node-fetch";
import { Config, loadConfig } from "../Config";
import { BotCommand } from "../handlers/commandHandler";
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

async function membercountGroupHandler(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildConfig = await loadConfig(interaction.guild!.id);

    switch (subcommand) {
        case "enable": {
            const enable = interaction.options.getBoolean("enable");
            const isEnabled = guildConfig.memberCount.enabled;
            guildConfig.memberCount.enabled = enable === null ? true : enable;
            guildConfig.save();

            interaction.reply(`${guildConfig.memberCount.enabled ? "Enabled" : "Disabled"} membercount.`);

            if (isEnabled != guildConfig.memberCount.enabled) {
                if (guildConfig.memberCount.enabled) {
                    const countChannel = interaction.guild!.channels.cache.find((channel) =>
                        channel.name.startsWith(guildConfig.memberCount.channelName)
                    );
                    if (!countChannel)
                        return interaction.guild!.channels.create(
                            guildConfig.memberCount.channelName + interaction.guild!.memberCount,
                            {
                                type: "GUILD_CATEGORY",
                                position: 0,
                            }
                        );
                    countChannel.setName(guildConfig.memberCount.channelName + interaction.guild!.memberCount);
                } else {
                    const countChannel = interaction.guild!.channels.cache.find((channel) =>
                        channel.name.startsWith(guildConfig.memberCount.channelName)
                    );
                    if (countChannel) countChannel.delete();
                }
            }
            break;
        }
    }
}

async function joinroleGroupHandler(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildConfig = await loadConfig(interaction.guild!.id);

    switch (subcommand) {
        case "enable": {
            const enable = interaction.options.getBoolean("enable");
            guildConfig.joinRole.enabled = enable === null ? true : enable;
            guildConfig.save();

            interaction.reply(`${guildConfig.joinRole.enabled ? "Enabled" : "Disabled"} joinrole.`);
            break;
        }
        case "role": {
            const role = interaction.options.getRole("role", true);
            guildConfig.joinRole.roleId = role.id;
            guildConfig.save();

            interaction.reply(`Set joinrole to <@&${role.id}>.`);
            break;
        }
    }
}

async function levelsystemGroupHandler(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildConfig = await loadConfig(interaction.guild!.id);

    switch (subcommand) {
        case "color": {
            const hexcode = interaction.options.getString("hexcode")?.toLocaleLowerCase() || "ffffff";
            const match = hexcode.match(/[0-f]{6}/);
            if (match) {
                guildConfig.levelsystem.color = match[0];
                guildConfig.save();

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
                const tempfilePath = `./tempLevelImageFile${interaction.guild!.id}`;
                interaction.deferReply();
                await downloadFile(levelImageAttachment.url, tempfilePath);

                gm(tempfilePath).identify((err, data) => {
                    if (err) {
                        unlinkSync(tempfilePath);
                        return interaction.editReply("Please upload an image file.");
                    }
                    gm(tempfilePath)
                        .resizeExact(720, 200)

                        .toBuffer("PNG", function (err: Error, buffer: Buffer) {
                            if (err)
                                return interaction.editReply(
                                    `There was an error while processing your image.\n\`\`\`json\n${JSON.stringify(
                                        err,
                                        null,
                                        2
                                    )}\n\`\`\``
                                );
                            unlinkSync(tempfilePath);

                            guildConfig.levelsystem.levelImage = buffer;
                            guildConfig.save();

                            interaction.editReply(`Saved image!`);
                        });
                });
                break;
            } else interaction.reply("Please attach an image.");
            break;
        }

        case "enable": {
            const enable = interaction.options.getBoolean("enable");
            guildConfig.levelsystem.enabled = enable === null ? true : enable;
            guildConfig.save();

            interaction.reply(`${guildConfig.levelsystem.enabled ? "Enabled" : "Disabled"} levelsystem.`);

            /**
             * @todo remove levelsystem commands if disabled, add them if enabled
             */
            break;
        }
    }
}

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Configure bot settings for this Server.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommandGroup((group) =>
            group
                .setName("levelsystem")
                .setDescription("Configure settings about the levelsystem module")
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
        )
        .addSubcommandGroup((group) =>
            group
                .setName("membercount")
                .setDescription("Configure settings about the membercount module")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("enable")
                        .setDescription("Enables/Disables the levelsystem")
                        .addBooleanOption((option) =>
                            option.setName("enable").setDescription("Should this module be enabled?").setRequired(true)
                        )
                )
        )
        .addSubcommandGroup((group) =>
            group
                .setName("joinrole")
                .setDescription("Configure settings about the joinrole module")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("enable")
                        .setDescription("Enables/Disables the joinrole module.")
                        .addBooleanOption((option) =>
                            option.setName("enable").setDescription("Should this module be enabled?").setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("role")
                        .setDescription("Set the role that should be assigned to new members when they join.")
                        .addRoleOption((option) => option.setName("role").setDescription("Role").setRequired(true))
                )
        ),
    check: async function (_guildConfig: Config) {
        return true;
    },
    run: function (interaction: CommandInteraction) {
        const commandGroup = interaction.options.getSubcommandGroup();

        switch (commandGroup) {
            case "levelsystem":
                levelsystemGroupHandler(interaction);
                break;
            case "membercount":
                membercountGroupHandler(interaction);
                break;
            case "joinrole":
                joinroleGroupHandler(interaction);
                break;

            default:
                return `Unsupported configuration option.`;
        }
    },
} as BotCommand;
