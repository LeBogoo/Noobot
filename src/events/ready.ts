import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Client } from "discord.js";
import dotenv from "dotenv";
import { readdirSync } from "fs";
import mongoose from "mongoose";
import { Config, loadConfig } from "../Config";
import { PATHS } from "../helper";
dotenv.config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

async function getUserCount(client: Client): Promise<number> {
    let users = new Set();

    for (let [id, guild] of client.guilds.cache) {
        const members = await guild.members.fetch();
        members.forEach((member) => users.add(member.id));
    }

    return users.size;
}

async function cycleActiviy(client: Client, index: number) {
    const activities = [`${client.guilds.cache.size} servers!`, `${await getUserCount(client)} users!`];

    const activityMessage = activities[index];
    client.user?.setActivity(activityMessage, { type: "WATCHING" });
    index++;
    if (index == activities.length) index = 0;
    setTimeout(() => {
        cycleActiviy(client, index);
    }, 10000);
}

async function getCommands(guildConfig: Config) {
    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    /**
     * Add default commands
     */
    const defaultCommands = readdirSync(PATHS.COMMANDS);
    for (let i = 0; i < defaultCommands.length; i++) {
        const command = (await import(`../commands/${defaultCommands[i]}`)).default;

        if (await command.check(guildConfig)) {
            const commandName = defaultCommands[i].split(".")[0];
            const builder = command.builder as SlashCommandBuilder;
            builder.setName(commandName);
            commands.push(builder.toJSON());
        }
    }

    /**
     * Add context menu commands
     */
    const contextMenus = readdirSync(PATHS.CONTEXT_MENUS);
    for (let i = 0; i < contextMenus.length; i++) {
        const command = (await import(`../contextMenus/${contextMenus[i]}`)).default;
        if (await command.check(guildConfig)) {
            const commandName = contextMenus[i].split(".")[0];
            const builder = command.builder as SlashCommandBuilder;
            builder.setName(commandName);
            commands.push(builder.toJSON());
        }
    }

    /**
     * Add custom commands
     */
    if (guildConfig.customCommands.enabled) {
        commands.push(...Array.from(guildConfig.customCommands.commands).map((e) => e[1].commandJSON));
    }

    return commands;
}

export default async function (client: Client) {
    console.log(`${client.user?.username} is ready!`);
    cycleActiviy(client, 0);
    await mongoose.connect(
        // Look at .env_examle for a template!
        `mongodb://${process.env.DB_ADDRESS || "localhost"}:${process.env.DB_PORT || "27017"}/${client.user!.username}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
        (error) => {
            if (error) console.log(error.message);
            else console.log("Connected to database!");
        }
    );

    /**
     * Register all commands to each guild
     */
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
    client.guilds.cache.forEach(async (guild) => {
        /**
         * Create default  configs if they don't exist.
         */
        const guildConfig = await loadConfig(guild.id);
        guildConfig.save();

        const memberCount = guildConfig.memberCount;
        if (memberCount.enabled) {
            const countChannel = guild.channels.cache.find((channel) =>
                channel.name.startsWith(memberCount.channelName)
            );
            if (!countChannel)
                return guild.channels.create(memberCount.channelName + guild.memberCount, {
                    type: "GUILD_CATEGORY",
                    position: 0,
                });
            countChannel.setName(memberCount.channelName + guild.memberCount);
        }

        /**
         * Send all commands to guild
         */
        rest.put(Routes.applicationGuildCommands(client.application?.id, guild.id), {
            body: await getCommands(guildConfig),
        });
    });
}
