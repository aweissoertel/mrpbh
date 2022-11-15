import { SlashCommandBuilder } from "@discordjs/builders";
import { help } from "../components/musicPlayer/voiceSetup";

export const data = new SlashCommandBuilder()
                        .setName('bothilfe')
                        .setDescription('Zeigt Hilfe für Mr.PoopyButtHole Bot');

export const execute = async (interaction) => {
    const embed = await help();
    await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
