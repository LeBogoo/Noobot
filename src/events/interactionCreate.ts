import { Client, Interaction } from "discord.js";
import commandHandler from "../handlers/commandHandler";
export default function (_client: Client, interaction: Interaction) {
    if (interaction.isCommand()) commandHandler(interaction);
}