import { Client, Interaction } from "discord.js";
import commandHandler from "../handlers/commandHandler";
import messageContextHandler from "../handlers/messageContextMenuHandler";
import modalHandler from "../handlers/modalHandler";

export default function (_client: Client, interaction: Interaction) {
    if (interaction.isCommand()) commandHandler(interaction);
    if (interaction.isMessageContextMenu()) messageContextHandler(interaction);
    if (interaction.isModalSubmit()) modalHandler(interaction);
}
