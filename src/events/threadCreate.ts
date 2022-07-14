import { Client, ThreadChannel } from "discord.js";
export default function (_client: Client, threadChannel: ThreadChannel) {
    threadChannel.join();
}
