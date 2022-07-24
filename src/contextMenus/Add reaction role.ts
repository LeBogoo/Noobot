import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType, PermissionFlagsBits } from "discord-api-types/v10";
import {
    Message,
    MessageActionRow,
    MessageContextMenuInteraction,
    MessageSelectMenu,
    MessageSelectOptionData,
    Modal,
    ModalSubmitInteraction,
    TextInputComponent,
} from "discord.js";
import { logger } from "..";
import { Config } from "../Config";

export default {
    builder: new ContextMenuCommandBuilder()
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setType(ApplicationCommandType.Message),

    modalSubmit: function (interaction: ModalSubmitInteraction) {
        let emoji = interaction.fields.getField("emojiInput").value.match(/\p{Emoji}/gu);
        if (!emoji) return interaction.reply("Please enter a valid Emoji.");

        // const roleId = interaction
        interaction.reply("This feature is currently not working. Waiting for User/Role mention Selects.");
        // interaction.reply(`Emoji: ${emoji}, Role: NOT SUPPORTED`);
    },
    check: async function (guildConfig: Config) {
        return guildConfig.reactionMessages.enabled;
    },
    run: function (interaction: MessageContextMenuInteraction) {
        const targetMessage = interaction.targetMessage as Message;

        const modal = new Modal()
            .setCustomId("contextMenus_Add reaction role_" + targetMessage.id)
            .setTitle("Create reaction message");

        const emojiInput = new TextInputComponent()
            .setCustomId("emojiInput")
            .setLabel("What emoji should give the role?")
            .setRequired(true)
            .setStyle("SHORT");

        const roles = interaction.guild?.roles.cache
            .filter((role) => {
                return role.id != interaction.guild?.id;
            })
            .map((role) => {
                return {
                    label: role.name,
                    value: role.id,
                };
            });

        logger.log(roles);

        const roleInput = new MessageSelectMenu()
            .setCustomId("roleInput")
            .setPlaceholder("What role should the user be given?")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(roles as MessageSelectOptionData[]);

        // @ts-ignore
        const firstActionRow = new MessageActionRow().addComponents(emojiInput);
        // @ts-ignore

        const secondActionRow = new MessageActionRow().addComponents(roleInput);
        // Add inputs to the modal

        // @ts-ignore
        modal.addComponents(firstActionRow, secondActionRow);

        interaction.showModal(modal);

        // return `You've selected the message: \`${targetMessage.cleanContent}\``;
    },
};
