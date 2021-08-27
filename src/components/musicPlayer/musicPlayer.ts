import { AudioPlayerStatus, AudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { GuildMember, Message, Snowflake, User } from "discord.js";
import { MusicSubscription } from "./subscription";
import { Track } from "./track";

const subscriptions = new Map<Snowflake, MusicSubscription>();

export function schedulePlayMessage(message: Message) {
    if (!message.member) {
        message.reply('Kein Member (hier läuft was falsch)');
    }
    const arg = message.content.split(' ')[1];
    let ytLink = '';
    if (arg?.startsWith('http') || arg?.startsWith('youtu')) {
        ytLink = arg;
    } else {
        //TODO: get yt link from arg
        ytLink = 'https://youtu.be/FC3y9llDXuM';
    }

    const reply = async (content: string): Promise<void> => { await message.reply(content) };

    play(ytLink, message.guildId as string, message.member!, reply);
}

export function playerInteractMessage(message: Message, _command: string) {
    const reply = async (content: string): Promise<void> => { await message.reply(content) };
    let command = '';
    switch(_command) {
        case 'pause':
            command = 'pause';
            break;
        case 'unpause':
            command = 'resume';
            break;
        case 'weiter':
            command = 'skip';
            break;
        case 'tschö':
            command = 'leave';
            break;
        case 'warteschlange':
        case 'ws':
            command = 'queue';
            break;
    }
    interact(command, message.guildId as string, reply);

}

async function interact(command: string, guildId: string, reply: (c: string) => Promise<void>): Promise<void> {
    let subscription = subscriptions.get(guildId);
    if (command === 'pause') {
        if (subscription) {
            subscription.audioPlayer.pause();
            await reply('Pausiert');
        } else {
            await reply('Ich spiele garnicht?');
        }
    } else if (command === 'resume') {
        if (subscription) {
            subscription.audioPlayer.unpause();
            reply('Weiter gehts');
        } else {
            await reply('Ich spiele garnicht?');
        }
    } else if (command === 'skip') {
        if (subscription) {
            // Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
            // listener defined in music/subscription.ts, transitions into the Idle state mean the next track from the queue
            // will be loaded and played.
            subscription.audioPlayer.stop();
            await reply('Song geskipped');
        } else {
            await reply('Ich spiele garnicht?');
        }
    } else if (command === 'leave') {
        if (subscription) {
            subscription.voiceConnection.destroy();
            subscriptions.delete(guildId);
            await reply('tüddelü 👋');
        } else {
            await reply('Ich spiele garnicht?');
        }
    } else if (command === 'queue') {
        // Print out the current queue, including up to the next 5 tracks to be played.
        if (subscription) {
            const current =
                subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
                    ? `Gerade wird nichts abgespielt`
                    : `**${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}** wird abgespielt`;

            const queue = subscription.queue
                .slice(0, 5)
                .map((track, index) => `${index + 1}) ${track.title}`)
                .join('\n');

            await reply(`${current}\n\n${queue}`);
        } else {
            await reply('Ich spiele garnicht?');
        }
    }
}

async function play(link: string, guildId: string, sender: GuildMember, reply: (c: string) => Promise<void>): Promise<void> {
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
        await reply(`**${track.title}** eingereiht`);
    } catch (error) {
        console.warn(error);
        await reply('Irgendwas ist schief gelaufen, probier nochmal oder lass einfach');
    }
}
