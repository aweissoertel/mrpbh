import { AudioPlayerStatus, AudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import axios from "axios";
import { EmojiIdentifierResolvable, GuildMember, Message, MessageEmbed, MessagePayload, MessageReaction, ReplyMessageOptions, Snowflake } from "discord.js";
import { MusicSubscription } from "./subscription";
import { Track } from "./track";
import { commands } from "./voiceSetup";
import { dispatchError } from "../..";
import spotifyService_ from "../spotifyService";
import { getLyricsEmbed, noSongPlaying } from "./lyrics";


const subscriptions = new Map<Snowflake, MusicSubscription>();
export type replyType = (options: string | MessagePayload | ReplyMessageOptions) => Promise <void>;
export type reactType = (emoji: EmojiIdentifierResolvable) => Promise<MessageReaction>;
const spotifyService = new spotifyService_();

export async function schedulePlayMessage(message: Message) {
    if (!message.member) {
        dispatchError('Fehler: Kein Member (mP/schedulePlayMessage)', message);
    }
    // get _everything_ after _first_ whitespace
    const firstSpace = message.content.indexOf(' ');
    let arg = message.content.slice(firstSpace + 1);
    const isPlaylistShuffle = message.content.includes(' shuffle');

    
    const reply: replyType = async (options) => { await message.reply(options) };
    const reaction: reactType = async (emoji) => { return await message.react(emoji) };
    if (arg?.startsWith('http') && arg?.includes('youtu')) {
        //youtube link provided, could be video or playlist
        if (!arg.includes('playlist')) {
            play(arg, message.guildId as string, message.member!, reply, reaction);
        } else {
            // TODO: not command compatible
            if (isPlaylistShuffle) {
                const secondSpace = arg.indexOf(' ');
                arg = arg.slice(0,secondSpace);
            }
            const listId = arg.slice(arg.indexOf('list=')+5);
            playlist(listId, message.guildId as string, message.member!, reply, isPlaylistShuffle);
        }
    } else if (arg?.startsWith('http') && arg?.includes('open.spotify')) {
        // spotify link provided, could be song or playlist or album
        if (arg.includes('playlist')) {
            const id = arg.slice(arg.indexOf('playlist/') + 9, arg.indexOf('?') === -1 ? undefined : arg.indexOf('?'));
            spotify(id, message.guildId as string, message.member!, reply, 'playlist', isPlaylistShuffle);
        } else if (arg.includes('album')) {
            const id = arg.slice(arg.indexOf('album/') + 6, arg.indexOf('?') === -1 ? undefined : arg.indexOf('?'));
            spotify(id, message.guildId as string, message.member!, reply, 'album', isPlaylistShuffle);
        } else if (arg.includes('track')) {
            const id = arg.slice(arg.indexOf('track/') + 6, arg.indexOf('?') === -1 ? undefined : arg.indexOf('?'));
            spotify(id, message.guildId as string, message.member!, reply, 'track', false, reaction);
        } else {
            reply('Komischen Spotify Link hast du da. Bot kann nur Songs, Alben und Playlists abspielen.');
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
        play(ytLink, message.guildId as string, message.member!, reply, reaction);
    }
}

export function playerInteractMessage(message: Message, _command: string) {
    const reply = async (content: string | MessagePayload | ReplyMessageOptions): Promise<void> => { await message.reply(content) };
    const reaction = async (emoji: EmojiIdentifierResolvable): Promise<MessageReaction> => { return await message.react(emoji) };
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
        case commands.lyrics:
            command = 'lyrics';
            break;
    }
    interact(command, message.guildId as string, reply, reaction);

}

export async function searchYoutube(key: string): Promise<string> {
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

async function interact(command: string, guildId: string, reply: replyType, reaction: reactType): Promise<void> {
    let subscription = subscriptions.get(guildId);
    if (!subscription) {
        await reply('Ich spiele gar nicht?');
        return;
    }
    if (command === 'pause') {
        subscription.audioPlayer.pause();
        await reaction('⏸️');
    } else if (command === 'resume') {
        subscription.audioPlayer.unpause();
        reaction('▶️');
    } else if (command === 'stop') {
        subscription.stop();
        reaction('🛑');
    } else if (command === 'skip') {
        // Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
        // listener defined in music/subscription.ts, transitions into the Idle state mean the next track from the queue
        // will be loaded and played.
        subscription.audioPlayer.stop();
        await reaction('⏭️');
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
    } else if (command === 'lyrics') {
        if (subscription.audioPlayer.state.status === AudioPlayerStatus.Idle) {
            reply({ embeds: [noSongPlaying()] })
        } else {
            reply({ embeds: [await getLyricsEmbed((subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title)] })
        }
    }
}

async function play(link: string, guildId: string, sender: GuildMember, reply: replyType, reaction: reactType): Promise<void> {
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
                await reaction('▶️');
            },
            async onFinish() {
                await reaction('✅');
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

export async function spotify(id: string, guildId: string, sender: GuildMember, reply: replyType, type = 'track', shuffle = false, reaction?: reactType) {
    // fetch songs from spotify (see postman)
    // for every item, do a const track = await Track.from(link, ... ) (see play)
    // could also use subscription.enqueuePlaylist(items)
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

    if (type === 'album' || type === 'playlist') {
        let songs = type === 'album' ? (await spotifyService.getAlbum(id)) : (await spotifyService.getPlaylist(id));
        if (shuffle) songs = shuffleArray(songs);
        subscription.enqueueSpotifyPlaylist(songs, reply);
    } else {
        const track = await spotifyService.getTrack(id);
        const idx = await searchYoutube(track);
        if (!idx) {
            dispatchError('Fehler: searchYoutube undefined (mP/schedulePlayMessage)');
            reply('YouTube-Suche fehlgeschlagen. Hm joa weiß auch nicht. Probier stattdessen einen Link');
            return;
        }
        const ytLink = 'https://youtu.be/' + idx;
        play(ytLink, guildId, sender, reply, reaction!);
    }
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
