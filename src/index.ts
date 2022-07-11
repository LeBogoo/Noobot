import * as dotenv from 'dotenv';
import { Client, Intents } from 'discord.js';
import { readdirSync, mkdirSync } from 'fs';
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

/**
 * Create initial folder structure
 * @todo Make it server independent!
*/
mkdirSync('./data/customCommands', { recursive: true });
mkdirSync('./data/configs', { recursive: true });

/**
 * Register all events listed in 'src/events' dir.
 */
readdirSync('./src/events').forEach(async file => {
    const event = (await import('./events/' + file)).default;
    const eventName = file.split('.')[0];
    client.on(eventName, (...args: unknown[]) => event(client, ...args));
});

client.login(process.env.TOKEN);