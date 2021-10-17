import { Message } from 'discord.js';
import { bobbyCounter, aufgeklatscht } from './counter';
import { playerInteractMessage, schedulePlayMessage } from './musicPlayer/musicPlayer';
import { commands, help, voiceSetup } from './musicPlayer/voiceSetup'

export function messageHandler(message: Message): void {
    const format = message.content.toLowerCase().trim();
    switch (format) {
        case '!voicesetup':
            //caution
            voiceSetup(message);
            return;
        case 'bobby':
        case 'bobby kraulen':
            bobbyCounter()
                .then(reply => { message.reply(reply) })
            return;
        case commands.pause:
        case commands.resume:
        case commands.stop:
        case commands.skip:
        case commands.stop:
        case commands.leave:
        case 'skip':
        case 'ws':
            playerInteractMessage(message, format);
            return;
        case 'hilfe':
            help().then(e => { message.reply({ embeds: [e] }) });
            return;
    }
    if (format.startsWith('aufgeklatscht')) {
        aufgeklatscht(message)
            .then(reply => { message.reply({ embeds: [reply] }) });
    }
    if (format.startsWith('play')) {
        schedulePlayMessage(message);
    }
}
