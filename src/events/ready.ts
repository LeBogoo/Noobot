import { Client } from "discord.js";
import { readdirSync } from "fs";
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');


export default async function (client: Client) {
    console.log(`${client.user?.username} is ready!`);
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: 'WATCHING' });

    var commands = readdirSync('./src/commands');

    for (let i = 0; i < commands.length; i++) {
        var command = (await import(`../commands/${commands[i]}`)).default;
        var commandName = commands[i].split('.')[0];
        command.builder.setName(commandName);
        commands[i] = command.builder.toJSON();
    }

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

    client.guilds.cache.forEach(guild => {
        rest.put(
            Routes.applicationGuildCommands(client.application?.id, guild.id),
            { body: commands },
        );
    })
}
