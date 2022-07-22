import { Client, GuildMember } from "discord.js";
import { loadConfig } from "../Config";

export default async function (client: Client, member: GuildMember) {
    if (member.user.id == client.user!.id) return;
    const guild = member.guild;
    const guildConfig = await loadConfig(guild.id);
    const memberCount = guildConfig.memberCount;
    if (memberCount.enabled) {
        const countChannel = guild.channels.cache.find((channel) => channel.name.startsWith(memberCount.channelName));
        if (!countChannel)
            return guild.channels.create(memberCount.channelName + guild.memberCount, {
                type: "GUILD_CATEGORY",
                position: 0,
            });
        countChannel.setName(memberCount.channelName + guild.memberCount);
    }
}
