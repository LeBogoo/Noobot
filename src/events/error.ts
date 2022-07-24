import { Client } from "discord.js";
import { logger } from "..";

export default async function (client: Client, error: Error) {
    logger.log(`ERROR: ${error.name} | ${error.message}`);
}
