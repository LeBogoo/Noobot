import { SlashCommandBuilder } from "@discordjs/builders";
import { createCanvas, loadImage, registerFont } from "canvas";
import { CommandInteraction, Guild, MessageAttachment, MessageEmbed, User } from "discord.js";
import { GuildConfig } from "../Config";
import { roundRect } from "../helper";
import { LevelStorage, LevelUser } from "../LevelStorage";
import { BotCommand } from "../types";
import runes from "runes";
async function generateLevelImage(levelUser: LevelUser, guild: Guild): Promise<MessageAttachment> {
    const config = GuildConfig.load(guild.id);
    const barWidth = 520;
    const barThickness = 26;
    const pfp = await loadImage(levelUser.pictureURL.replace("webp", "png"));
    const canvas = createCanvas(720, 200);
    const ctx = canvas.getContext("2d");
    let background;
    try {
        background = await loadImage(`./data/${guild.id}/LevelBackdrop.png`);
    } catch (_) {}

    registerFont("./src/assets/RobotoCondensed-Light.ttf", { family: "RobotoCondensed-Light" });

    // Background (masked)
    const padding = 3;
    roundRect(ctx, padding, padding, canvas.width - 2 * padding, canvas.height - 2 * padding, 20, false, false);
    ctx.save();
    ctx.clip();
    if (background) ctx.drawImage(background, 0, 0);
    else {
        ctx.fillStyle = "#339e85";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // Set styles for texts and fills
    ctx.strokeStyle = `#${config.levelsystem.color}`;
    ctx.fillStyle = `#${config.levelsystem.color}`;

    // Background border
    ctx.lineWidth = 5;
    ctx.stroke();

    // Profile picture (masked)
    ctx.beginPath();
    ctx.arc(36 + 64, 36 + 64, 64, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    ctx.drawImage(pfp, 36, 36, 128, 128);
    ctx.restore();

    // Profile picture cirlce
    ctx.lineWidth = 5;
    ctx.stroke();

    // Username (limited to 20 chars)
    ctx.font = '52px "RobotoCondensed-Light, sans-serif"';
    let nameText = runes.substr(levelUser.username, 0, 12);
    ctx.fillText(nameText == levelUser.username ? nameText : `${nameText}...`, 188, 83);

    // Rank and Level
    ctx.font = '40px "RobotoCondensed-Light"';
    ctx.fillText(`Rang: ${levelUser.rank}`, 557, 70);
    ctx.fillText(`Level: ${levelUser.level}\n`, 557, 115);

    // Progress text
    ctx.font = '25px "RobotoCondensed-Light"';
    ctx.fillText(`${Math.max(0, levelUser.relativeXp)} / ${levelUser.relativeNextLevelXp} XP`, 360, 140);

    ctx.fillStyle = `#${config.levelsystem.color}33`; // make this transparent
    roundRect(ctx, 172, 148, barWidth, barThickness, barThickness / 2, true, false);

    // draw roundRect again with percentage as width
    ctx.fillStyle = `#${config.levelsystem.color}`;
    roundRect(
        ctx,
        172,
        148,
        Math.max(barThickness, barWidth * levelUser.percentage),
        barThickness,
        barThickness / 2,
        true,
        false
    );

    return new MessageAttachment(canvas.toBuffer(), `${levelUser.username}-level.png`);
}

function percentToBars(percent: number, width: number): string {
    let out = "";
    for (let i = 0; i < width; i++) out += percent * width <= i ? "⬛" : "⬜";
    return out;
    /**
        @todo: Make progress bar with these emotes:
        -------------------------------------------
        :start_0: <:start_0:997261173042974881>
        :start_1: <:start_1:997261174200598638>
        :start_2: <:start_2:997261175400185957>
        :start_3: <:start_3:997261176578785351>
        :start_4: <:start_4:997261177954500779>
        :mid_0:   <:mid_0:997261167045120041>
        :mid_1:   <:mid_1:997261168244707459>
        :mid_2:   <:mid_2:997261169544921138>
        :mid_3:   <:mid_3:997261170685771946>
        :mid_4:   <:mid_4:997261171893735495>
        :end_0:   <:end_0:997261156546789517>
        :end_1:   <:end_1:997261157750554795>
        :end_2:   <:end_2:997261158920757278>
        :end_3:   <:end_3:997261164587266108>
        :end_4:   <:end_4:997261165828775936>
     */
}

export default {
    builder: new SlashCommandBuilder()
        .setDescription("Shows you what level you are")
        .setDMPermission(false)

        .addUserOption((option) =>
            option.setName("user").setDescription("Mention a user to see their level.").setRequired(false)
        )
        .addBooleanOption((option) =>
            option
                .setName("textversion")
                .setDescription("Set this to true if you only want to receive a text version.")
                .setRequired(false)
        ),

    run: async function (interaction: CommandInteraction) {
        const useText = interaction.options.getBoolean("textversion") || false;
        const selectedUser = interaction.options.getUser("user")
            ? interaction.options.getUser("user")
            : interaction.member!.user;

        const storage: LevelStorage = LevelStorage.load(interaction.guild!.id);
        const levelUser = storage.getLevelUser(selectedUser as User);

        if (useText) {
            // Generate text version and send it
            const embed = new MessageEmbed();
            embed.setTitle(`${levelUser.username} - Level`);
            embed.setDescription(
                `Level: ${levelUser.level} | XP: ${levelUser.relativeXp} | Rank ${levelUser.rank}` +
                    `Progress: ${levelUser.relativeXp}/${levelUser.relativeNextLevelXp}\n` +
                    `${percentToBars(levelUser.percentage, 10)} (${Math.floor(levelUser.percentage * 100)}%)`
            );
            return { embeds: [embed] };
        }

        // Generate image and send it
        return {
            files: [await generateLevelImage(levelUser, interaction.guild as Guild)],
        };
    },
} as unknown as BotCommand;
