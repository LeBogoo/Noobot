import * as dotenv from 'dotenv';
import { Client, Intents, Interaction } from 'discord.js';
import { readdirSync } from 'fs';
dotenv.config();


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

readdirSync('./src/events').forEach(async file => {
    const event = (await import('./events/' + file)).default;
    const eventName = file.split('.')[0];
    client.on(eventName, (...args: any[]) => event(client, ...args));
});

client.login(process.env.TOKEN);