import { Client, Guild } from "discord.js";
import { getConfig, PATHS, saveConfig } from "../helper";
import { mkdirSync } from "fs";

export default function (client: Client, guild: Guild) {
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: "WATCHING" });

    const customCommandPath = PATHS.guild_commands(guild.id);
    mkdirSync(customCommandPath, { recursive: true });

    saveConfig(getConfig(guild.id));
}
