import * as dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import { readdirSync, mkdirSync } from "fs";
import { PATHS } from "./helper";
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

/**
 * Create initial folder structure
 */
mkdirSync(PATHS.CUSTOM_COMMANDS, { recursive: true });
mkdirSync(PATHS.CONFIGS, { recursive: true });
mkdirSync(PATHS.FEEDBACK_DONE, { recursive: true });
mkdirSync(PATHS.FEEDBACK_PENDING, { recursive: true });

/**
 * Register all events listed in 'src/events' dir.
 */
readdirSync("./src/events").forEach(async (file) => {
    const event = (await import("./events/" + file)).default;
    const eventName = file.split(".")[0];
    client.on(eventName, (...args: unknown[]) => event(client, ...args));
});

client.login(process.env.TOKEN);
