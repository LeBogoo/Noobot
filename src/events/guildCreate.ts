import { Client, Guild } from "discord.js";
import { PATHS } from "../helper";
import { mkdirSync } from "fs";
import { GuildConfig } from "../Config";

export default function (client: Client, guild: Guild) {
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: "WATCHING" });

    const customCommandPath = PATHS.guild_commands(guild.id);
    mkdirSync(customCommandPath, { recursive: true });

    GuildConfig.load(guild.id).save();
}
