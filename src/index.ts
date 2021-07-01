import Discord from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import { messageHandler } from './components/messageHandler.js';

const client = new Discord.Client();
client.login(process.env.TOKEN);

client.once('ready', () => {
	console.log('Bot started up');
    client.user?.setPresence({status: 'dnd', activity: {name: 'you 👀', type: 'WATCHING'}})
        .catch(console.error);
});

client.on('message', message => {
    if (message.author.bot) return;
    messageHandler(message);
});

client.on('shardError', error => {
    console.error('A websocket connection encountered an error:', error);
});
