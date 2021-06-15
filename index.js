import Discord from 'discord.js';
import { messageHandler } from './components/messageHandler.js';
import dotenv from 'dotenv';
dotenv.config();

//const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.TOKEN);

client.once('ready', () => {
	console.log('Bot started up');
    client.user.setPresence({status: 'dnd', activity: {name: 'you 👀', type: 'WATCHING'}})
        .catch(console.error);
});

client.on('message', message => {
    if (message.author.bot) return;
    messageHandler(message);
});
