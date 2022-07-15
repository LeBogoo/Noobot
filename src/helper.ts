import { Guild } from "discord.js";
import { readdirSync } from "fs";

export const PATHS = {
    DATA: "./data",
    COMMANDS: "./src/commands",
    CONTEXT_MENUS: "./src/contextMenus",
    CUSTOM_COMMANDS: "./data/customCommands",
    CONFIGS: "./data/configs",
    FEEDBACK_DONE: "./data/feedback/done",
    FEEDBACK_PENDING: "./data/feedback/pending",
    guild_folder: (guildId: string | null | undefined) => `./data/${guildId}`,
};

/**
 * @param name Command name
 * @returns If this default command exists
 */
export function isCommand(name: string): boolean {
    const commands = readdirSync("./src/commands");
    return commands.includes(`${name}.ts`);
}

/**
 * @param name Command name
 * @returns If this custom command exists
 */
export function isCustomCommand(name: string, guild: Guild | null): boolean {
    const commands = readdirSync(`${PATHS.guild_folder(guild?.id)}/customCommands`);
    return commands.includes(`${name}.json`);
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius;
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
export function roundRect(ctx, x, y, width, height, radius = 5, fill = false, stroke = true) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}
