import { Client, GuildMember } from "discord.js";
import { logger } from "..";
import { loadConfig } from "../Config";

export default async function (client: Client, member: GuildMember) {
    const guild = member.guild;
    const guildConfig = await loadConfig(guild.id);
    const memberCount = guildConfig.memberCount;
    const joinRole = guildConfig.joinRole;

    logger.log(
        `Member joined Guild ${guild.name}: ${member.user.username}#${member.user.discriminator} (${member.id})`
    );

    if (joinRole.enabled) {
        const role = guild.roles.cache.find((guildRole) => guildRole.id == joinRole.roleId);
        if (role) member.roles.add(role);
    }
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
