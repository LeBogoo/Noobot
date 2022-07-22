import { Client, Guild } from "discord.js";
import { loadConfig } from "../Config";

export default async function (client: Client, guild: Guild) {
    const guildConfig = await loadConfig(guild.id);
    guildConfig.save();
}
