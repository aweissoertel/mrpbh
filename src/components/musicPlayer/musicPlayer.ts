import { AudioPlayerStatus, AudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import axios from "axios";
import { GuildMember, Message, MessageEmbed, MessagePayload, ReplyMessageOptions, Snowflake } from "discord.js";
import { MusicSubscription } from "./subscription";
import { Track } from "./track";
import { commands } from "./voiceSetup";
import { dispatchError } from "../..";


const subscriptions = new Map<Snowflake, MusicSubscription>();
export type replyType = (options: string | MessagePayload | ReplyMessageOptions) => Promise <void>;

export async function schedulePlayMessage(message: Message) {
    if (!message.member) {
        dispatchError('Fehler: Kein Member (mP/schedulePlayMessage)', message);
    }
    // get _everything_ after _first_ whitespace
    const firstSpace = message.content.indexOf(' ');
    let arg = message.content.slice(firstSpace + 1);

    
    const reply: replyType = async (options) => { await message.reply(options) };
    if (arg?.startsWith('http') || arg?.startsWith('youtu')) {
        //link provided, could be video or playlist
        if (!arg.includes('playlist')) {
            play(arg, message.guildId as string, message.member!, reply);
        } else {
            // TODO: not command compatible
            const isPlaylistShuffle = message.content.includes(' shuffle');
            if (isPlaylistShuffle) {
                const secondSpace = arg.indexOf(' ');
                arg.slice(0,secondSpace);
            }
            const listId = arg.slice(arg.indexOf('list=')+5);
            playlist(listId, message.guildId as string, message.member!, reply, isPlaylistShuffle);
        }
    } else {
        // search term provided, search for video
        const id = await searchYoutube(arg);
        if (!id) {
            dispatchError('Fehler: searchYoutube undefined (mP/schedulePlayMessage)', message);
            message.reply('YouTube-Suche fehlgeschlagen. Hm joa weiß auch nicht. Probier stattdessen einen Link');
            return;
        }
        const ytLink = 'https://youtu.be/' + id;
        play(ytLink, message.guildId as string, message.member!, reply);
    }
}

export function playerInteractMessage(message: Message, _command: string) {
    const reply = async (content: string): Promise<void> => { await message.reply(content) };
    let command = '';
    switch (_command) {
        case commands.pause:
            command = 'pause';
            break;
        case commands.resume:
            command = 'resume';
            break;
        case commands.stop:
            command = 'stop';
            break;
        case commands.skip:
        case 'skip':
            command = 'skip';
            break;
        case commands.leave:
            command = 'leave';
            break;
        case commands.queue:
        case 'ws':
            command = 'queue';
            break;
    }
    interact(command, message.guildId as string, reply);

}

async function searchYoutube(key: string): Promise<string> {
    let id = '';
    try {
        const response = await axios({
            url: `https://youtube.googleapis.com/youtube/v3/search`,
            params: {
                part: 'id',
                maxResults: 3,
                q: key,
                type: 'video',
                key: process.env.YT_TOKEN
            }
        });
        const video = response.data.items.find(item => item.id.kind === 'youtube#video');
        id = video.id.videoId;
    } catch (e) {
        console.log(e);
        dispatchError('Fehler: axios call youtube api fehlgeschlagen');
    }
    return id;
}

async function interact(command: string, guildId: string, reply: (c: string) => Promise<void>): Promise<void> {
    let subscription = subscriptions.get(guildId);
    if (!subscription) {
        await reply('Ich spiele gar nicht?');
        return;
    }
    if (command === 'pause') {
        subscription.audioPlayer.pause();
        await reply('Pausiert');
    } else if (command === 'resume') {
        subscription.audioPlayer.unpause();
        reply('Weiter gehts');
    } else if (command === 'stop') {
        subscription.stop();
        reply('Halt stop!');
    } else if (command === 'skip') {
        // Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
        // listener defined in music/subscription.ts, transitions into the Idle state mean the next track from the queue
        // will be loaded and played.
        subscription.audioPlayer.stop();
        await reply('Song geskipped');
    } else if (command === 'leave') {
        subscription.voiceConnection.destroy();
        subscriptions.delete(guildId);
        await reply('tüddelü 👋');
    } else if (command === 'queue') {
        const current =
            subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
                ? `Gerade wird nichts abgespielt`
                : `**${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}** wird abgespielt`;

        const queue = subscription.queue
            .slice(0, 5)
            .map((track, index) => `${index + 1}) ${track.title}`)
            .join('\n');

        await reply(`${current}\n\n${queue}`);
    }
}

async function play(link: string, guildId: string, sender: GuildMember, reply: replyType): Promise<void> {
    let subscription = subscriptions.get(guildId);


    // If a connection to the guild doesn't already exist and the user is in a voice channel, join that channel
    // and create a subscription.
    if (!subscription) {
        if (sender instanceof GuildMember && sender.voice.channel) {
            const channel = sender.voice.channel;
            subscription = new MusicSubscription(
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                }),
            );
            subscription.voiceConnection.on('error', console.warn);
            subscriptions.set(guildId, subscription);
        }
    }

    // If there is no subscription, tell the user they need to join a channel.
    if (!subscription) {
        await reply('Join erstmal nem Voicechannel');
        return;
    }

    // Make sure the connection is ready before processing the user's request
    try {
        await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
    } catch (error) {
        console.warn(error);
        dispatchError('Fehler: subscription.voiceConnection state nicht erreicht (mP/play)');
        await reply('Konnte Voicechannel nicht innerhalb von 20 Sekunden beitreten, versuch gleich nochmal');
        return;
    }

    try {
        // Attempt to create a Track from the user's video URL
        const track = await Track.from(link, {
            async onStart() {
                await reply('Ab gehts');
            },
            async onFinish() {
                await reply('Feddich');
            },
            async onError(error) {
                console.warn(error);
                await reply(`Fehler: ${error.message}`);
            },
        });
        // Enqueue the track and reply a success message to the user
        subscription.enqueue(track);
        const embed = new MessageEmbed()
            .setColor('#FEE75C')
            .setDescription(`[**${track.title}**](${track.url}) eingereiht`)
            .setThumbnail(track.thumb)
            .setTimestamp()
            .setFooter(':)', 'https://cdn.discordapp.com/avatars/519217034530127903/5ba34624d113bdbf4b48dd1c3c574130.png')
        await reply({ embeds: [embed] });
    } catch (error) {
        console.warn(error);
        dispatchError('Fehler: track erstellung oder enqueue fehlgeschlagen in mP/play');
        await reply('Irgendwas ist schief gelaufen, probier nochmal oder lass einfach');
    }
}

async function playlist(arg: string, guildId: string, sender: GuildMember, reply: replyType, shuffle: boolean = false): Promise<void> {
    let subscription = subscriptions.get(guildId);


    // If a connection to the guild doesn't already exist and the user is in a voice channel, join that channel
    // and create a subscription.
    if (!subscription) {
        if (sender instanceof GuildMember && sender.voice.channel) {
            const channel = sender.voice.channel;
            subscription = new MusicSubscription(
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                }),
            );
            subscription.voiceConnection.on('error', console.warn);
            subscriptions.set(guildId, subscription);
        }
    }

    // If there is no subscription, tell the user they need to join a channel.
    if (!subscription) {
        await reply('Join erstmal nem Voicechannel');
        return;
    }

    let items;
    try {
    // retrieve array of video ids in playlist from youtube api
        const response = await axios({
            url: 'https://youtube.googleapis.com/youtube/v3/playlistItems',
            params: {
                maxResults: 50,
                part: 'contentDetails',
                playlistId: arg,
                key: process.env.YT_TOKEN,
            },
        });
        items = response.data?.items.map(item => {
            const video = item.contentDetails?.videoId;
            if (video) return `https://youtu.be/${video}`;
        });
    } catch (error) {
        dispatchError('Axios request error (YT Playlist query) mP/playlist');
        console.log(error);
        return;
    }
    if (!items) {
        //error
        dispatchError('Keine Antwort von YT playlist query mP/playlist');
        return;
    }
    items = shuffle ? shuffleArray(items) : items;
    subscription.enqueuePlaylist(items, reply);
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
