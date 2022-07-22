import { Client } from "discord.js";

export default async function (client: Client, error: Error) {
    console.log(`ERROR: ${error.name} | ${error.message}`);
}
