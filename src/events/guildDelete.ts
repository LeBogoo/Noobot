import { Client, Guild } from "discord.js";
import { deleteConfig } from "../Config";

export default function (client: Client, guild: Guild) {
    deleteConfig(guild.id);
}
