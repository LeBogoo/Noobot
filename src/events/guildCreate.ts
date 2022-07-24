import { Client, Guild } from "discord.js";
import { logger } from "..";
import { loadConfig } from "../Config";

export default async function (client: Client, guild: Guild) {
    logger.log(`Bot joined Guild: ${guild.name} (${guild.id})`);
    const guildConfig = await loadConfig(guild.id);
    guildConfig.save();
}
