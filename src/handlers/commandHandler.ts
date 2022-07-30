import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { CommandInteraction } from "discord.js";
import { readdirSync } from "fs";
import { Config, CustomCommandsConfig, loadConfig } from "../Config";
import { PATHS } from "../helper";

/**
 * @param name Command name
 * @returns If this default command exists
 */
export function isCommand(name: string): boolean {
    const commands = readdirSync("./commands");
    return commands.includes(`${name}.ts`);
}

/**
 * @param name Command name
 * @returns If this custom command exists
 */
export function getCustomCommand(customCommandsConfig: CustomCommandsConfig, name: string): undefined | JsonCommand {
    return customCommandsConfig.commands.has(name) ? customCommandsConfig.commands.get(name) : undefined;
}

export async function getCommands(guildConfig: Config) {
    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    /**
     * Add default commands
     */
    const defaultCommands = readdirSync(PATHS.COMMANDS);
    for (let i = 0; i < defaultCommands.length; i++) {
        const command = (await import(`../commands/${defaultCommands[i]}`)).default;

        if (await command.check(guildConfig)) {
            const commandName = defaultCommands[i].split(".")[0];
            const builder = command.builder as SlashCommandBuilder;
            builder.setName(commandName);
            commands.push(builder.toJSON());
        }
    }

    /**
     * Add context menu commands
     */
    const contextMenus = readdirSync(PATHS.CONTEXT_MENUS);
    for (let i = 0; i < contextMenus.length; i++) {
        const command = (await import(`../contextMenus/${contextMenus[i]}`)).default;
        if (await command.check(guildConfig)) {
            const commandName = contextMenus[i].split(".")[0];
            const builder = command.builder as SlashCommandBuilder;
            builder.setName(commandName);
            commands.push(builder.toJSON());
        }
    }

    /**
     * Add custom commands
     */
    if (guildConfig.customCommands.enabled) {
        commands.push(...Array.from(guildConfig.customCommands.commands).map((e) => e[1].commandJSON));
    }

    return commands;
}

export default async function (interaction: CommandInteraction) {
    const guildConfig = await loadConfig(interaction.guild!.id);

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
    const customCommand = getCustomCommand(guildConfig.customCommands, interaction.commandName);
    if (customCommand) {
        const result = customCommand.response;
        if (result) interaction.reply(result);
        return;
    }

    interaction.reply(`Command \`${interaction.commandName}\` not found!`);
}

export type JsonCommand = {
    commandJSON: RESTPostAPIApplicationCommandsJSONBody;
    response: string;
};

export type BotCommand = {
    builder: SlashCommandBuilder;
    check: (guildConfig: Config) => Promise<boolean>;
    run: (interaction: CommandInteraction) => unknown;
};
