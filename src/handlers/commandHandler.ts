import { CommandInteraction } from "discord.js";
import { readdirSync, readFileSync } from "fs";
import { JsonCommand } from "../types";

function isCommand(name: string): boolean {
    const commands = readdirSync("./src/commands");
    return commands.includes(`${name}.ts`);
}
function isCustomCommand(name: string): boolean {
    const commands = readdirSync("./src/customCommands");
    return commands.includes(`${name}.json`);
}

export default async function (interaction: CommandInteraction) {
    /**
     * Handle default commands (global commands)
     * @todo Make it global commands!
     */
    if (isCommand(interaction.commandName)) {
        const command = (await import(`../commands/${interaction.commandName}.ts`))
            .default;
        const result = await command.run(interaction);
        if (result) interaction.reply(result);
        return;
    }

    /**
     * Handle custom commands
     * @todo Make it server independent!
     */
    if (isCustomCommand(interaction.commandName)) {
        const content = readFileSync(`./src/customCommands/${interaction.commandName}.json`).toString();
        const command = JSON.parse(content) as JsonCommand;
        const result = command.response;
        if (result) interaction.reply(result);
        return;
    }

    interaction.reply(`Command \`${interaction.commandName}\` not found!`);
}
