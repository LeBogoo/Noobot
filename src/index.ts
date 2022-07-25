import { Client, Intents } from "discord.js";
import * as dotenv from "dotenv";
import { readdirSync } from "fs";
import { Logger } from "./Logger";
dotenv.config();

export const logger = new Logger("../logs");




const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
});

/**
 * Register all events listed in 'src/events' dir.
 */
readdirSync("./events").forEach(async (file) => {
    const event = (await import("./events/" + file)).default;
    const eventName = file.split(".")[0];
    client.on(eventName, (...args: unknown[]) => event(client, ...args));
});

client.login(process.env.TOKEN);

process.on('uncaughtException', (error) => {
    logger.log(`An error occured: ${error.stack}`);
})