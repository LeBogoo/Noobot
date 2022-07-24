import { Client, Message } from "discord.js";
import { logger } from "..";
import levelsystemHandler from "../handlers/levelsystemHandler";
export default function (_client: Client, message: Message) {
    logger.log(
        `Message sent: ${message.author.username}#${message.author.discriminator} (${message.author.id}) | ${message.content}`
    );
    levelsystemHandler(message);
}
