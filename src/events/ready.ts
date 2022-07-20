import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Client } from "discord.js";
import dotenv from "dotenv";
import { readdirSync } from "fs";
import mongoose from "mongoose";
import { loadConfig } from "../Config";
import { PATHS } from "../helper";
dotenv.config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

export default async function (client: Client) {
    console.log(`${client.user?.username} is ready!`);
    client.user?.setActivity(`${client.guilds.cache.size} servers!`, { type: "WATCHING" });

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

    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    /**
     * Add default commands
     */
    const defaultCommands = readdirSync(PATHS.COMMANDS);
    for (let i = 0; i < defaultCommands.length; i++) {
        const command = (await import(`../commands/${defaultCommands[i]}`)).default;
        const commandName = defaultCommands[i].split(".")[0];

        const builder = command.builder as SlashCommandBuilder;
        builder.setName(commandName);

        commands.push(builder.toJSON());
    }

    const contextMenus = readdirSync(PATHS.CONTEXT_MENUS);
    for (let i = 0; i < contextMenus.length; i++) {
        const command = (await import(`../contextMenus/${contextMenus[i]}`)).default;
        const commandName = contextMenus[i].split(".")[0];
        const builder = command.builder as SlashCommandBuilder;
        builder.setName(commandName);
        commands.push(builder.toJSON());
    }

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

        /**
         * Add custom commands
         */

        const customCommands: RESTPostAPIApplicationCommandsJSONBody[] = Array.from(
            guildConfig.customCommands.commands
        ).map((e) => e[1].commandJSON);

        rest.put(Routes.applicationGuildCommands(client.application?.id, guild.id), {
            body: [...commands, ...customCommands],
        });
    });
}
