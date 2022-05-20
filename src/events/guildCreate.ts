import { Client, Guild } from "discord.js";
export default function (client: Client, guild: Guild) {
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: 'WATCHING' });
}