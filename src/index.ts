import { Client, Intents } from "discord.js";
import * as dotenv from "dotenv";
import { readdirSync } from "fs";
dotenv.config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

/**
 * Register all events listed in 'src/events' dir.
 */
readdirSync("./src/events").forEach(async (file) => {
    const event = (await import("./events/" + file)).default;
    const eventName = file.split(".")[0];
    client.on(eventName, (...args: unknown[]) => event(client, ...args));
});

client.login(process.env.TOKEN);
