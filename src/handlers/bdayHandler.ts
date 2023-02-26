import { Client, GuildMember, Role } from "discord.js";
import { loadConfig } from "../Config";

async function checkGuild(client: Client, guildId: string) {
    const guildConfig = await loadConfig(guildId);
    const birthdays = guildConfig.birthdays;
    if (!guildConfig.birthdays.enabled) return;
    if (!birthdays.announcementChannel) return;
    const guild = await client.guilds.fetch(guildConfig.id);
    if (!guild) return;
    const announcementChannel = await guild.channels.fetch(birthdays.announcementChannel);
    if (!announcementChannel || announcementChannel.type != "GUILD_TEXT") return;

    const now = new Date();

    for (let [userId, date] of Array.from(birthdays.dates)) {
        let member: GuildMember | null = null;

        try {
            member = await guild.members.fetch(userId);
        } catch (e) {
            birthdays.dates.delete(userId);
            continue;
        }

        if (!member) return;

        var role: Role | null = null;
        if (birthdays.role) role = await guild.roles.fetch(birthdays.role);

        if (now.getDate() == date[0] && now.getMonth() + 1 == date[1]) {
            if (!birthdays.active.includes(userId)) {
                birthdays.active.push(userId);
                if (role) member.roles.add(role);
                announcementChannel.send(`Today is <@${userId}>'s Birthday :partying_face:`);
            }
        } else {
            if (role) member.roles.remove(role);
            birthdays.active = birthdays.active.filter((activeId) => activeId != userId);
        }
    }

    guildConfig.birthdays = birthdays;
    guildConfig.save();
}

export default async function (client: Client) {
    setInterval(async () => {
        for (let [id, _guild] of client.guilds.cache) await checkGuild(client, id);
    }, 1000 * 5 /* Every minute */);
}
