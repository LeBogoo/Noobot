import { MessageContextMenuInteraction } from "discord.js";

export default async function (interaction: MessageContextMenuInteraction) {
    /**
     * Handle contextMenu interactions
     * @todo Make it global commands!
     */

    const command = (await import(`../contextMenus/${interaction.commandName}.ts`)).default;
    const result = await command.run(interaction);
    if (result) interaction.reply(result);
}
