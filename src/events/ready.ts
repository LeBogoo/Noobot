import { Client } from "discord.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { logger } from "..";
import { loadConfig } from "../Config";
import apiHandler from "../handlers/apiHandler";
import bdayHandler from "../handlers/bdayHandler";
import { getCommands } from "../handlers/commandHandler";

dotenv.config();

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

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

export default async function (client: Client) {
    logger.log(`${client.user?.username} is ready!`);
    cycleActiviy(client, 0);
    bdayHandler(client);
    if (process.env.ENABLE_WEBSERVER == "true") apiHandler(client);

    await mongoose.connect(
        // Look at .env_examle for a template!
        `mongodb://${process.env.DB_ADDRESS || "localhost"}:${process.env.DB_PORT || "27017"}/${client.user!.username}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
        (error) => {
            if (error) logger.log(error.message);
            else logger.log("Connected to database!");
        }
    );

    /**
     * Register all commands to each guild
     */
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN!);
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
        rest.put(Routes.applicationGuildCommands(client.application!.id, guild.id), {
            body: await getCommands(guildConfig),
        });
    });
}
