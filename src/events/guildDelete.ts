import { Client, Guild } from "discord.js";
import { rmSync } from "fs";
import { PATHS } from "../helper";

export default function (client: Client, guild: Guild) {
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: "WATCHING" });

    rmSync(PATHS.guild_folder(guild.id), { recursive: true, force: true });
}
