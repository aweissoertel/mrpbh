import { Message } from 'discord.js';
import { bobbyCounter, aufgeklatscht } from './counter.js';
import { leave, pause, resume, schedulePlay } from './voice.js';

export function messageHandler(message: Message): void {
    const format = message.content.toLowerCase().trim();
    switch (format) {
        case 'bobby':
        case 'bobby kraulen':
            bobbyCounter()
                .then(reply => { message.reply(reply) })
            return;
        case 'pause':
            pause();
            return;
        case 'weiter':
            resume();
            return;
        case 'tschö':
            leave();
            return;
    }
    if (format.startsWith('aufgeklatscht')) {
        aufgeklatscht(message)
            .then(reply => { message.channel.send(reply) });
    }
    if (format.startsWith('play')) {
        schedulePlay(message);
    }
}
