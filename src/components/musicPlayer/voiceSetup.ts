import { Message, MessageEmbed, User } from "discord.js";
import { client } from "../..";

export async function voiceSetup(message: Message) {
    if (!message) return;
    await message.guild?.commands?.set([
        {
            name: 'play',
            description: 'Spielt einen Song ab',
            options: [
                {
                    name: 'song',
                    type: 'STRING' as const,
                    description: 'URL von einem Song',
                    required: true,
                },
            ],
        },
        {
            name: 'p',
            description: 'Spielt einen Song ab',
            options: [
                {
                    name: 'song',
                    type: 'STRING' as const,
                    description: 'URL von einem Song',
                    required: true,
                },
            ],
        },
        {
            name: 'skip',
            description: 'Nächster Song in Warteschlange',
        },
        {
            name: 'ws',
            description: 'Warteschlange ansehen',
        },
        {
            name: 'pause',
            description: 'Pausiert momentanen Song',
        },
        {
            name: 'weiter',
            description: 'Song fortsetzen',
        },
        {
            name: 'tschö',
            description: 'Channel verlassen',
        },
        {
            name: 'help',
            description: 'Hilfe anzeigen'
        },
        {
            name: 'h',
            description: 'Hilfe anzeigen'
        },
    ]);

    await message.reply('Deployed!');
}

export async function help(): Promise<MessageEmbed> {
    const alex = await client.users.fetch('158928685934706688');
    const fancyEmbed = new MessageEmbed()
        .setColor('#FEE75C')
        .setAuthor({ name: 'Mr. PoopyButtHole', url: 'https://twitter.com/squab_', iconURL: 'https://cdn.discordapp.com/avatars/519217034530127903/5ba34624d113bdbf4b48dd1c3c574130.png' })
        .setURL('https://twitter.com/squab_')
        .setTitle('Mr. PoopyButtHole Hilfe')
        .setDescription(`Bot zum Musik abspielen und so. ✨*Jetzt auch mit Spotify Support* (ง •_•)ง✨\nWenn was im Arsch ist oder einer ne Idee für noch ein Feature oder ne Frage hat: PM an ${alex || 'Alex'}`)
        .addFields(
            { name: '🔢 Counter Befehle', value: '**Bobby kraulen / Bobby**: krault Bobby ein Mal\n\n**Aufgeklatscht *@User* **: Wenn einer aufgeklatscht ist. *User* kannst du auch weglassen, wenn du selber so dumm warst' },
            { name: '\u200B', value: '\u200B' },
            {
                name: '🎶 MusikBot Befehle', value: `▶️ **${commands.play} *Song* *shuffle* **: *Song* abspielen. *Song* ist entweder ein YouTube/Spotify Link, ein Suchbegriff oder eine Playlist. Playlist wird zufällig wiedergegeben, wenn *shuffle* hinter dem Link steht\n
                ⏸️ **${commands.pause}**: Pause\n
                ⏯️ **${commands.resume}**: Fortsetzen\n
                ⏹️ **${commands.stop}**: Stop\n
                ⏭️ **${commands.skip}** oder **skip**: Nächster Song\n
                👋 **${commands.leave}**: Bot verlässt channel. Muss irgendwann kommen, sonst bleibt er für immer\n
                🧾 **${commands.queue}** oder **ws**: Aktuelle Warteschlange anzeigen\n
                🎤 **${commands.lyrics}**: Lyrics zu aktuellem Song anzeigen`
            }
        )
        .setTimestamp()
        .setFooter({ text: ':)', iconURL: 'https://cdn.discordapp.com/avatars/519217034530127903/5ba34624d113bdbf4b48dd1c3c574130.png' })

        return fancyEmbed;
}

export enum commands {
    play = 'play',
    pause = 'pause',
    resume = 'unpause',
    stop = 'stop',
    skip = 'weiter',
    leave = 'tschö',
    queue = 'warteschlange',
    lyrics = 'lyrics',
}
