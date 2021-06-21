import { Message } from 'discord.js';
import { bobbyCounter, aufgeklatscht } from './counter.js';

export function messageHandler(message: Message): void {
    const format = message.content.toLowerCase().trim();
    switch (format) {
        case 'bobby':
        case 'bobby kraulen':
            bobbyCounter()
                .then(reply => { message.reply(reply) })
            return;
    }
    if (format.startsWith('aufgeklatscht')) {
        aufgeklatscht(message)
            .then(reply => { message.reply(reply) });
    }
}
