import { Client, Guild } from "discord.js";
import { getConfig, saveConfig } from "../helper";
export default function (client: Client, guild: Guild) {
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: "WATCHING" });
    saveConfig(getConfig(guild.id));
}
