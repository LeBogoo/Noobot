import { Client, Guild } from "discord.js";
import { logger } from "..";
import { deleteConfig } from "../Config";

export default function (client: Client, guild: Guild) {
    logger.log(`Bot was kicked from Guild: ${guild.name} (${guild.id})`);
    deleteConfig(guild.id);
}
