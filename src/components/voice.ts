import { Message } from "discord.js";

export async function test(message: Message): Promise<void> {
    if (!message.member?.voice.channel) return;
    const connection = await message.member.voice.channel.join();

    const dispatcher = connection.play('https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3');

    dispatcher.on('start', () => {
        console.log('audio.mp3 is now playing!');
    });

    dispatcher.on('finish', () => {
        console.log('audio.mp3 has finished playing!');
        connection.disconnect();
    });

    dispatcher.on('error', _ => {
        console.log('error blyat');
        connection.disconnect();
    });
}