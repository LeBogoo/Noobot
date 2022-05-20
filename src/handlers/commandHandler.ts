import { CommandInteraction } from 'discord.js';
import { readdirSync } from 'fs';

export default async function (interaction: CommandInteraction) {

    const commands = readdirSync('./src/commands');
    if (!commands.includes(`${interaction.commandName}.ts`)) {
        interaction.reply(`Command \`${interaction.commandName}\` not found!`);
        return;
    }

    const command = (await import(`../commands/${interaction.commandName}.ts`)).default;
    // interaction.deferReply();
    const result = await command.run(interaction);
    if (result) interaction.reply(result);
}