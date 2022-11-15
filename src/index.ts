import Discord, { Intents, Message } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();
import { messageHandler } from './components/messageHandler.js';
import helpCommand from './commands/help';

const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS);
export const client = new Discord.Client({ intents: intents });
client.login(process.env.TOKEN);

// client.commands.set(helpCommand.data.name, helpCommand); 
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName !== 'bothilfe') return;

    try {
        await helpCommand.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.once('ready', () => {
    console.log('Bot started up');
    client.user?.setPresence({ status: 'dnd', activities: [{ name: 'you 👀', type: 'WATCHING' }] });
});

client.on('messageCreate', message => {
    if (message.author.bot) return;
    messageHandler(message);
});

client.on('shardError', error => {
    console.error('A websocket connection encountered an error:', error);
});

export const dispatchError = async (message: string, context?: Message): Promise<void> => {
    const alex = await client.users.fetch('158928685934706688');
    if (context) {
        context.channel.send(`Debug: ${message}; ${alex}`);
    } else {
        alex.send(message);
    }
}
