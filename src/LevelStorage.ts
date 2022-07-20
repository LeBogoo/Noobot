import { User } from "discord.js";
import { LevelsystemConfig } from "./Config";

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

export class LevelStorage {
    static xpToLevel = (levelSystemConfig: LevelsystemConfig, xp: number): number => {
        // get defaultOffset + multiplier from config
        return Math.floor((Math.max(0, xp - levelSystemConfig.defaultOffset) / levelSystemConfig.multiplier) ** 0.5);
    };

    static levelToXp = (levelSystemConfig: LevelsystemConfig, level: number): number => {
        // get defaultOffset + multiplier from config
        return Math.round(level ** 2) * levelSystemConfig.multiplier + levelSystemConfig.defaultOffset;
    };

    static getRanklist(levelSystemConfig: LevelsystemConfig): string[] {
        const ranklist = Object.entries(levelSystemConfig.points)
            .sort((a, b) => b[1] - a[1])
            .map((entry) => entry[0]);
        return ranklist;
    }

    static getLevelUserRank(levelSystemConfig: LevelsystemConfig, user: User): number {
        const ranklist = this.getRanklist(levelSystemConfig);
        let rank = ranklist.indexOf(user.id);
        if (rank == -1) rank = ranklist.length;
        return rank + 1;
    }

    static getLevelUser(levelSystemConfig: LevelsystemConfig, user: User): LevelUser {
        const xp = this.getLevelUserXp(levelSystemConfig, user);
        const level = Math.max(0, this.xpToLevel(levelSystemConfig, xp));
        const currentLevelXp = Math.max(0, this.levelToXp(levelSystemConfig, level));
        const nextLevelXp = Math.max(0, this.levelToXp(levelSystemConfig, level + 1));
        const relativePoints = Math.max(0, xp - currentLevelXp);
        const relativeNextLevelPoints = Math.max(nextLevelXp - currentLevelXp);

        const levelUser: LevelUser = {
            id: user.id,
            username: user.username,
            pictureURL: user.displayAvatarURL({ size: 128 }),
            rank: this.getLevelUserRank(levelSystemConfig, user),
            xp,
            level,
            currentLevelXp,
            nextLevelXp,
            relativeXp: relativePoints,
            relativeNextLevelXp: relativeNextLevelPoints,
            percentage: Math.max(0, relativePoints / relativeNextLevelPoints),
        };
        return levelUser;
    }

    static getLevelUserXp(levelSystemConfig: LevelsystemConfig, user: User): number {
        return Math.max(levelSystemConfig.points.get(user.id) || 0, 0);
    }

    static setLevelUserXp(levelSystemConfig: LevelsystemConfig, user: User, xp: number): LevelsystemConfig {
        levelSystemConfig.points.set(user.id, xp);
        return levelSystemConfig;
    }

    static addLevelUserXp(levelSystemConfig: LevelsystemConfig, user: User, xp: number): LevelsystemConfig {
        const currentXp = this.getLevelUserXp(levelSystemConfig, user);
        levelSystemConfig = this.setLevelUserXp(levelSystemConfig, user, currentXp + xp);
        return levelSystemConfig;
    }
}
