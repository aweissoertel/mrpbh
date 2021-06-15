import { bobbyCounter, aufgeklatscht } from './counter.js';

export function messageHandler(message){
    const format = message.content.toLowerCase().trim();
    switch (format) {
        case 'bobby':
        case 'bobby kraulen':
            message.reply(bobbyCounter());
            return;
    }
    if (message.content.toLowerCase().startsWith('aufgeklatscht')) {
        message.reply(aufgeklatscht(message));
    }
}
