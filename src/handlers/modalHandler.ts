import { ModalSubmitInteraction } from "discord.js";
import { existsSync } from "fs";

export default async function (interaction: ModalSubmitInteraction) {
    /**
     * Handle modal submissions
     * @todo Make it global commands!
     */
    const [triggerGroup, triggerFile, ...data] = interaction.customId.split("_");
    if (existsSync(`./src/${triggerGroup}/${triggerFile}.ts`)) {
        const command = (await import(`../${triggerGroup}/${triggerFile}.ts`)).default;
        if ("modalSubmit" in command) {
            command.modalSubmit(interaction);
        } else {
            interaction.deferReply();
        }
    }
}
