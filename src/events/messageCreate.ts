import { Client, Message } from "discord.js";
import levelsystemHandler from "../handlers/levelsystemHandler";
export default function (_client: Client, message: Message) {
    levelsystemHandler(message);
}
