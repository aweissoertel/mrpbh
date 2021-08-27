import Discord, {Intents} from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();
import { messageHandler } from './components/messageHandler.js';

const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS);
const client = new Discord.Client({intents: intents});
client.login(process.env.TOKEN);

client.once('ready', () => {
	console.log('Bot started up');
    client.user?.setPresence({status: 'dnd', activities: [{name: 'you 👀', type: 'WATCHING'}]});
});

client.on('messageCreate', message => {
    if (message.author.bot) return;
    messageHandler(message);
});

client.on('shardError', error => {
    console.error('A websocket connection encountered an error:', error);
});
