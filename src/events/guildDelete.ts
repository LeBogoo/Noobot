import { Client, Guild } from "discord.js";
import { PATHS } from "../helper";
import { rmSync } from "fs";

export default function (client: Client, guild: Guild) {
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: "WATCHING" });

    rmSync(PATHS.guild_folder(guild.id), { recursive: true, force: true });
}
