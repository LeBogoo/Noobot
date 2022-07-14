import { Message } from "discord.js";
import { LevelStorage, xpToLevel } from "../LevelStorage";

const cooldowns: { [key: string]: { [key: string]: number } } = {};

/**
 * @todo make all options configurable
 */
const cooldown = 5000;
export const xpLimit = 50;

export function getCapsPercentage(text: string): number {
    let upperCount = 0;
    for (let char of text) {
        if (char.toUpperCase() == char) upperCount++;
    }
    return upperCount / text.length;
}

function calculateXp(text: string): number {
    var emotes = text.match(/<a*:\w*:\d*>/g);
    if (emotes) for (let i = 0; i < emotes.length; i++) text = text.replace(emotes[i], "X");
    /**
     * @todo make caps blocking configurable (enable/disable, caps percentage)
     */
    if (getCapsPercentage(text) > 0.5) return 0;
    let messageLength = Math.min(text.length, xpLimit);
    return Math.max(Math.ceil(messageLength / 2), Math.ceil(Math.random() * messageLength));
}

export default async function ({ author, channel, cleanContent, client, guild, member }: Message) {
    if (!guild) return;
    if (author.bot) return;

    /**
     * @todo add system to ignore certain channels
     * @tood customizable levelup message
     */

    // Cooldown system
    if (!(guild.id in cooldowns)) cooldowns[guild.id] = {};

    const now = new Date().getTime();
    // Reject points if user still has cooldown left.
    if (author.id in cooldowns[guild.id] && cooldowns[guild.id][author.id] + cooldown > now) return;

    // Set new cooldown to current time
    cooldowns[guild.id][author.id] = now;
    // Increment xp system
    const storage: LevelStorage = LevelStorage.load(guild.id);
    const xpBefore = storage.getLevelUserXp(author);
    const addedXp = calculateXp(cleanContent);
    storage.addLevelUserXp(author, addedXp);
    const xpAfter = storage.getLevelUserXp(author);

    const oldLevel = xpToLevel(xpBefore, guild.id);
    const newLevel = xpToLevel(xpAfter, guild.id);

    if (oldLevel != newLevel)
        channel.send(`Congrats <@${author.id}>! You've just reached level ${newLevel}! :partying_face: :tada:`);

    storage.save();
}
