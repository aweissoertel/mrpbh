import { bobbyCounter, aufgeklatscht } from './counter.js';

export function messageHandler(message){
    switch (message.content.toLowerCase()) {
        case 'bobby':
        case 'bobby kraulen':
            message.reply(bobbyCounter());
            return;
    }
    if (message.content.toLowerCase().startsWith('aufgeklatscht')) {
        message.reply(aufgeklatscht(message));
    }
}
