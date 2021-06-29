import { Message, MessageEmbed } from 'discord.js';
import { Storage } from './storageHandler.js';

const bStorage = new Storage('bobby');
const aStorage = new Storage('aufgeklatscht');

export async function bobbyCounter(): Promise<string> {
    let counter = await bStorage.getItem('bobby');
    counter = Number(counter);
    bStorage.setItem('bobby', ++counter);
    return(
        `Bobby gekrault! Bobby wurde schon ${counter} Mal gekrault.`
    );
}

export async function aufgeklatscht(message: Message): Promise<MessageEmbed> {
    const tagged = message.mentions?.users?.first();
    const id = tagged ? tagged.id : message.author.id;
    let counter = 0;
    const value = await aStorage.getItem(String(id));
    if (value) {
        counter = Number(value);
        aStorage.setItem(String(id), ++counter);
    } else {
        console.log(`[DEBUG] aufgeklatscht: No entry found for this id: ${id}`);
        aStorage.createItem(String(id), ++counter);
    }

    const fancyEmbed = new MessageEmbed()
        .setColor('#FEE75C')
        .setTitle('Aufgeklatscht')
        .setDescription(`Opfer ${tagged ? tagged : message.author} ist aufgeklatscht.\nSchon ${counter} Mal aufgeklatscht.\n(${message.author})`)
        .setTimestamp()
        .setFooter(':)','https://cdn.discordapp.com/avatars/519217034530127903/5ba34624d113bdbf4b48dd1c3c574130.png')

    return fancyEmbed;
}
