import { Client, Message } from 'discord.js';
import { bobbyCounter, aufgeklatscht } from './counter';
import { playerInteractMessage, schedulePlayMessage } from './musicPlayer/musicPlayer';
import { voiceSetup } from './musicPlayer/voiceSetup'

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
        case 'pause':
        case 'unpause':
        case 'weiter':
        case 'tschö':
        case 'warteschlange':
        case 'ws':
            playerInteractMessage(message, format);
            return;
    }
    if (format.startsWith('aufgeklatscht')) {
        aufgeklatscht(message)
            .then(reply => { message.reply({embeds: [reply]}) });
    }
    if (format.startsWith('play')) {
        schedulePlayMessage(message);
    }
}
