import { Client, Guild } from "discord.js";
import { mkdirSync } from "fs";
import { GuildConfig } from "../Config";
import { PATHS } from "../helper";

export default function (client: Client, guild: Guild) {
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: "WATCHING" });

    const customCommandPath = `${PATHS.guild_folder(guild.id)}/customCommands`;
    mkdirSync(customCommandPath, { recursive: true });

    GuildConfig.load(guild.id).save();
}
