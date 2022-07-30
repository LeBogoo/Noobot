import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Client, Guild } from "discord.js";
import dotenv from "dotenv";
import { logger } from "..";
import { loadConfig } from "../Config";
import { getCommands } from "../handlers/commandHandler";

dotenv.config();

export default async function (client: Client, guild: Guild) {
    logger.log(`Bot joined Guild: ${guild.name} (${guild.id})`);
    const guildConfig = await loadConfig(guild.id);
    guildConfig.save();
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN!);
    /**
     * Send all commands to guild
     */
    rest.put(Routes.applicationGuildCommands(client.application!.id, guild.id), {
        body: await getCommands(guildConfig),
    });
}
