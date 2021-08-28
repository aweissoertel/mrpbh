import { AudioPlayerStatus, AudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import axios from "axios";
import { GuildMember, Message, MessageEmbed, MessagePayload, ReplyMessageOptions, Snowflake, User } from "discord.js";
import { MusicSubscription } from "./subscription";
import { Track } from "./track";
import { commands } from "./voiceSetup";

const subscriptions = new Map<Snowflake, MusicSubscription>();
type replyType = (options: string | MessagePayload | ReplyMessageOptions) => Promise <void>;

export async function schedulePlayMessage(message: Message) {
    if (!message.member) {
        message.reply('Kein Member (hier läuft was falsch)');
    }
    const arg = message.content.split(' ')[1];
    let ytLink = '';
    if (arg?.startsWith('http') || arg?.startsWith('youtu')) {
        ytLink = arg;
    } else {
        const id = await searchYoutube(arg);
        ytLink = 'https://youtu.be/' + id;
    }

    const reply: replyType = async (options) => { await message.reply(options) };

    play(ytLink, message.guildId as string, message.member!, reply);
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
                part: 'snippet',
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
    }
    return id;
}

async function interact(command: string, guildId: string, reply: (c: string) => Promise<void>): Promise<void> {
    let subscription = subscriptions.get(guildId);
    if (!subscription) {
        await reply('Ich spiele garnicht?');
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
        await reply('Irgendwas ist schief gelaufen, probier nochmal oder lass einfach');
    }
}
