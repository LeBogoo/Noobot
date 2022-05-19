import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Client } from "discord.js";
import { readdirSync, readFileSync } from "fs";
import { JsonCommand } from "../types";
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

function readCommandFile(path): JsonCommand {
    return JSON.parse(readFileSync(path).toString());
}

export default async function (client: Client) {
    console.log(`${client.user?.username} is ready!`);
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: 'WATCHING' });

    var commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    var defaultCommands = readdirSync('./src/commands');

    for (let i = 0; i < defaultCommands.length; i++) {
        var command = (await import(`../commands/${defaultCommands[i]}`)).default;
        var commandName = defaultCommands[i].split('.')[0];

        var builder = command.builder as SlashCommandBuilder;
        builder.setName(commandName);

        commands.push(builder.toJSON());
    }

    var customCommands = readdirSync('./src/customCommands');

    for (let i = 0; i < customCommands.length; i++) {
        const customCommand = readCommandFile(`../commands/${defaultCommands[i]}.json`)
        var commandName = customCommand.commandJSON.name;
        
        commands.push(customCommand.commandJSON);
    }
    
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

    client.guilds.cache.forEach(guild => {
        rest.put(
            Routes.applicationGuildCommands(client.application?.id, guild.id),
            { body: commands },
        );
    })
}

