import { CommandInteraction } from "discord.js";
import { readFileSync } from "fs";
import { isCommand, isCustomCommand, PATHS } from "../helper";
import { JsonCommand } from "../types";

export default async function (interaction: CommandInteraction) {
    /**
     * Handle default commands (global commands)
     * @todo Make it global commands!
     */
    if (isCommand(interaction.commandName)) {
        const command = (await import(`../commands/${interaction.commandName}.ts`)).default;
        const result = await command.run(interaction);
        if (result) interaction.reply(result);
        return;
    }

    /**
     * Handle custom commands
     */
    if (isCustomCommand(interaction.commandName, interaction.guild)) {
        const content = readFileSync(
            `${PATHS.guild_folder(interaction.guild?.id)}/customCommands/${interaction.commandName}.json`
        ).toString();
        const command = JSON.parse(content) as JsonCommand;
        const result = command.response;
        if (result) interaction.reply(result);
        return;
    }

    interaction.reply(`Command \`${interaction.commandName}\` not found!`);
}
