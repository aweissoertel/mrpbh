import { Message } from "discord.js";

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
