import { Message, StreamDispatcher, VoiceConnection } from "discord.js";
import ytdl from 'ytdl-core-discord';

let connection: VoiceConnection;
let dispatcher: StreamDispatcher;

function dispatchSetup() {
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
    });
}

export async function schedulePlay(message: Message): Promise<void> {
    if (!message.member?.voice.channel || connection) {console.log(connection); return;}
    //TODO: get yt link
    const ytlink = 'https://youtu.be/FC3y9llDXuM';

    connection = await message.member.voice.channel.join();
    play(ytlink);
}

export async function play(link: string) {
    dispatcher = connection.play(await ytdl(link), { type: 'opus', fec: true, bitrate: 'auto', highWaterMark: 16 });
    dispatchSetup();
}

export async function pause() {
    dispatcher?.pause();
}

export async function resume() {
    dispatcher?.resume();
}

export async function leave() {
    connection.disconnect();
}
