import { getConfig, saveConfig } from "../helper";
import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Client } from "discord.js";
import { readdirSync, readFileSync, mkdirSync } from "fs";
import { PATHS } from "../helper";
import { JsonCommand } from "../types";
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

function readCommandFile(path): JsonCommand {
    return JSON.parse(readFileSync(path).toString());
}

export default async function (client: Client) {
    console.log(`${client.user?.username} is ready!`);
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: "WATCHING" });

    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    /**
     * Add default commands
     */
    const defaultCommands = readdirSync(PATHS.COMMANDS);
    for (let i = 0; i < defaultCommands.length; i++) {
        const command = (await import(`../commands/${defaultCommands[i]}`)).default;
        const commandName = defaultCommands[i].split(".")[0];

        const builder = command.builder as SlashCommandBuilder;
        builder.setName(commandName);

        commands.push(builder.toJSON());
    }

    const contextMenus = readdirSync(PATHS.CONTEXT_MENUS);
    for (let i = 0; i < contextMenus.length; i++) {
        const command = (await import(`../contextMenus/${contextMenus[i]}`)).default;
        const commandName = contextMenus[i].split(".")[0];
        const builder = command.builder as SlashCommandBuilder;
        builder.setName(commandName);
        commands.push(builder.toJSON());
    }

    /**
     * Register all commands to each guild
     */
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
    client.guilds.cache.forEach((guild) => {
        /**
         * Create directories for guild if they don't exist.
         */

        const customCommandPath = PATHS.guild_commands(guild.id);
        mkdirSync(customCommandPath, { recursive: true });

        // Create config if it doesn't exist
        saveConfig(getConfig(guild.id));

        /**
         * Add custom commands
         */
        const customCommandsList = readdirSync(customCommandPath);
        const customCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        for (let i = 0; i < customCommandsList.length; i++) {
            const customCommand = readCommandFile(`${customCommandPath}/${customCommandsList[i]}`);
            customCommands.push(customCommand.commandJSON);
        }

        rest.put(Routes.applicationGuildCommands(client.application?.id, guild.id), {
            body: [...commands, ...customCommands],
        });
    });
}
