import { GuildMember, User } from "discord.js";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { PATHS } from "./helper";

export type LevelUser = {
    id: string;
    username: string;
    pictureURL: string;
    rank: number;
    xp: number;
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    relativeXp: number;
    relativeNextLevelXp: number;
    percentage: number;
};

/**
 * @todo make all options configurable
 */
export const multiplier = 50;
export const defaultOffset = 10;

export const xpToLevel = (xp: number, guildId: string): number => {
    // get defaultOffset + multiplier from config
    return Math.floor((Math.max(0, xp - defaultOffset) / multiplier) ** 0.5);
};

export const levelToXp = (level: number, guildId: string): number => {
    // get defaultOffset + multiplier from config
    return Math.round(level ** 2) * multiplier + defaultOffset;
};

export class LevelStorage {
    guildId: string = "";
    points: { [key: string]: number } = {};

    constructor(guildId: string) {
        this.guildId = guildId;
    }

    getRanklist(): string[] {
        const ranklist = Object.entries(this.points)
            .sort((a, b) => b[1] - a[1])
            .map((entry) => entry[0]);
        return ranklist;
    }

    getLevelUserRank(user: User): number {
        const ranklist = this.getRanklist();
        let rank = ranklist.indexOf(user.id);
        if (rank == -1) rank = ranklist.length;
        return rank + 1;
    }

    getLevelUser(user: User): LevelUser {
        const xp = this.getLevelUserXp(user);
        const level = xpToLevel(xp, this.guildId);
        const currentLevelXp = levelToXp(level, this.guildId);
        const nextLevelXp = levelToXp(level + 1, this.guildId);
        const relativePoints = xp - currentLevelXp;
        const relativeNextLevelPoints = nextLevelXp - currentLevelXp;

        const levelUser: LevelUser = {
            id: user.id,
            username: user.username,
            pictureURL: user.displayAvatarURL(),
            rank: this.getLevelUserRank(user),
            xp,
            level,
            currentLevelXp,
            nextLevelXp,
            relativeXp: relativePoints,
            relativeNextLevelXp: relativeNextLevelPoints,
            percentage: relativePoints / relativeNextLevelPoints,
        };
        return levelUser;
    }

    getLevelUserXp(user: User): number {
        console.log(this.points);

        return this.points[user.id] || 0;
    }

    setLevelUserXp(user: User, xp: number) {
        this.points[user.id] = xp;
    }

    addLevelUserXp(user: User, xp: number) {
        const currentXp = this.getLevelUserXp(user) || 0;
        this.setLevelUserXp(user, currentXp + xp);
    }

    save() {
        mkdirSync(PATHS.guild_folder(this.guildId), { recursive: true });
        writeFileSync(`${PATHS.guild_folder(this.guildId || "")}/levels.json`, JSON.stringify(this, null, 4));
    }

    static load(id: string): LevelStorage {
        try {
            let loaded = JSON.parse(readFileSync(`${PATHS.guild_folder(id || "")}/levels.json`).toString());
            return Object.assign(new LevelStorage(id), loaded);
        } catch {
            return new LevelStorage(id);
        }
    }
}
