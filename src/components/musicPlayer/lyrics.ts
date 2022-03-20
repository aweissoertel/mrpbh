import { MessageEmbed } from "discord.js";
import { getSong } from 'genius-lyrics-api';

export async function getLyricsEmbed(title: string): Promise<MessageEmbed> {
    const options = {
        apiKey: process.env.GENIUS_TOKEN,
        title: title,
        artist: ' ',
        optimizeQuery: true
    };
    let song;
    try {
        song = await getSong(options);
    } catch (error) {
        console.log(error);
    }

    const embed = new MessageEmbed()
        .setColor('#FEE75C')
        .setAuthor('Mr. PoopyButtHole', 'https://cdn.discordapp.com/avatars/519217034530127903/5ba34624d113bdbf4b48dd1c3c574130.png', 'https://twitter.com/squab_')
        .setTimestamp()
        .setFooter(':)', 'https://cdn.discordapp.com/avatars/519217034530127903/5ba34624d113bdbf4b48dd1c3c574130.png')
    if (!song || !song.lyrics) {
        embed
            .setTitle('Fehler')
            .setDescription('Fehler beim holen der lyrics :(\nKann sein, dass es keine gibt')
        return embed;
    }
    embed
        .setURL(song.url)
        .setTitle(`Lyrics für "${song.title}"`.concat(song.artist ? `von ${song.artist}` : ''))
        .setThumbnail(song.albumArt)
        .setDescription(song.lyrics)
    return embed;
}

export function noSongPlaying(): MessageEmbed {
    const embed = new MessageEmbed()
        .setColor('#FEE75C')
        .setAuthor('Mr. PoopyButtHole', 'https://cdn.discordapp.com/avatars/519217034530127903/5ba34624d113bdbf4b48dd1c3c574130.png', 'https://twitter.com/squab_')
        .setURL('https://i.kym-cdn.com/entries/icons/mobile/000/035/360/unga.jpg')
        .setTitle('Confused Unga Bunga')
        .setThumbnail('https://i.kym-cdn.com/entries/icons/mobile/000/035/360/unga.jpg')
        .setDescription('Gerade wird nichts abgespielt, was hast du jetzt erwartet')
        .setTimestamp()
        .setFooter(':)', 'https://cdn.discordapp.com/avatars/519217034530127903/5ba34624d113bdbf4b48dd1c3c574130.png')
    return embed;
}
