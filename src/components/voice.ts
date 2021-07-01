import { Message } from "discord.js";
import ytdl from 'ytdl-core-discord';

export async function test(message: Message): Promise<void> {
    if (!message.member?.voice.channel) return;
    const connection = await message.member.voice.channel.join();

    //const dispatcher = connection.play('https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3');
    /*
    async function play(connection, url) {
        connection.play(await ytdl(url), { type: 'opus' });
    }
    */
    connection.on('debug', console.log);

    const dispatcher = connection.play(await ytdl('https://youtu.be/FC3y9llDXuM'), { type: 'opus', fec: true, bitrate: 'auto', highWaterMark: 16 });

    dispatcher.on('start', () => {
        console.log('now playing!');
    });

    dispatcher.on('finish', () => {
        console.log('finished playing!');
        connection.disconnect();
    });

    dispatcher.on('error', e => {
        console.log('error blyat');
        console.log(e);
        //connection.disconnect();
    });
}